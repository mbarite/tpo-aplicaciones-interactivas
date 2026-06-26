const Match = require("../models/match.model");
const Team = require("../models/team.model");
const catchAsync = require("../utils/catchAsync");
const httpError = require("../utils/httpError");
const serializeMatch = require("../utils/serializeMatch");
const resolveSeasonId = require("../utils/resolveSeasonId");

function mapPlayerStats(stats) {
  if (!Array.isArray(stats)) {
    return undefined;
  }
  return stats
    .filter((item) => item && item.playerId)
    .map((item) => ({ player: item.playerId, points: Number(item.points) || 0 }));
}

async function validateTeams(homeTeamId, awayTeamId) {
  if (homeTeamId === awayTeamId) {
    throw httpError(400, "El equipo local y visitante deben ser distintos.");
  }

  const teams = await Team.find({
    _id: { $in: [homeTeamId, awayTeamId] }
  })
    .select("name")
    .lean();

  if (teams.length !== 2) {
    throw httpError(404, "Alguno de los equipos seleccionados no existe.");
  }
}

const listMatches = catchAsync(async (req, res) => {
  const filter = {};

  if (req.query.status === "scheduled" || req.query.status === "played") {
    filter.status = req.query.status;
  }

  const seasonId = await resolveSeasonId(req.query.season);
  if (seasonId) {
    filter.season = seasonId;
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const matches = await Match.find(filter)
    .populate("homeTeam", "name")
    .populate("awayTeam", "name")
    .populate("season", "name year")
    .sort({ date: 1, time: 1 })
    .lean();

  res.json(matches.map(serializeMatch));
});

const createMatch = catchAsync(async (req, res) => {
  const { homeTeamId, awayTeamId, date, time, venue, category } = req.body;
  const seasonId = req.body.seasonId || (await resolveSeasonId(null));

  if (!seasonId) {
    throw httpError(
      400,
      "No hay una temporada activa. Crea o activa una temporada antes de crear partidos."
    );
  }

  await validateTeams(homeTeamId, awayTeamId);

  const match = await Match.create({
    season: seasonId,
    category,
    homeTeam: homeTeamId,
    awayTeam: awayTeamId,
    date,
    time,
    venue
  });

  await match.populate("homeTeam", "name");
  await match.populate("awayTeam", "name");
  await match.populate("season", "name year");

  res.status(201).json({
    message: "Partido creado correctamente.",
    match: serializeMatch(match)
  });
});

const updateMatch = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const { homeTeamId, awayTeamId, date, time, venue, category, seasonId } = req.body;
  const match = await Match.findById(matchId);

  if (!match) {
    throw httpError(404, "Partido no encontrado.");
  }

  const nextHomeTeamId = homeTeamId || match.homeTeam.toString();
  const nextAwayTeamId = awayTeamId || match.awayTeam.toString();
  await validateTeams(nextHomeTeamId, nextAwayTeamId);

  match.homeTeam = nextHomeTeamId;
  match.awayTeam = nextAwayTeamId;
  match.date = date ?? match.date;
  match.time = time ?? match.time;
  match.venue = venue ?? match.venue;
  match.category = category ?? match.category;
  if (seasonId) {
    match.season = seasonId;
  }

  await match.save();
  await match.populate("homeTeam", "name");
  await match.populate("awayTeam", "name");
  await match.populate("season", "name year");

  res.json({
    message: "Partido actualizado correctamente.",
    match: serializeMatch(match)
  });
});

const deleteMatch = catchAsync(async (req, res) => {
  const match = await Match.findById(req.params.matchId);

  if (!match) {
    throw httpError(404, "Partido no encontrado.");
  }

  await match.deleteOne();

  res.json({
    message: "Partido eliminado correctamente."
  });
});

const loadResult = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const { homeScore, awayScore } = req.body;
  const match = await Match.findById(matchId);

  if (!match) {
    throw httpError(404, "Partido no encontrado.");
  }

  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.status = "played";

  const homeStats = mapPlayerStats(req.body.homePlayerStats);
  const awayStats = mapPlayerStats(req.body.awayPlayerStats);
  if (homeStats) {
    match.homePlayerStats = homeStats;
  }
  if (awayStats) {
    match.awayPlayerStats = awayStats;
  }

  await match.save();
  await match.populate("homeTeam", "name");
  await match.populate("awayTeam", "name");
  await match.populate("season", "name year");

  res.json({
    message: "Resultado cargado correctamente.",
    match: serializeMatch(match)
  });
});

module.exports = {
  listMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  loadResult
};
