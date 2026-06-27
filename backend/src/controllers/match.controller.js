const Match = require("../models/match.model");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
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
    .populate("homeTeam", "name logoUrl")
    .populate("awayTeam", "name logoUrl")
    .populate("season", "name year")
    .sort({ date: 1, time: 1 })
    .lean();

  res.json(matches.map(serializeMatch));
});

// Detalle de un partido + la alineacion (plantel de cada equipo en la categoria
// del partido) con los puntos que anoto cada jugador en ese partido.
const getMatchById = catchAsync(async (req, res) => {
  const match = await Match.findById(req.params.matchId)
    .populate("homeTeam", "name coachName logoUrl")
    .populate("awayTeam", "name coachName logoUrl")
    .populate("season", "name year")
    .lean();

  if (!match) {
    throw httpError(404, "Partido no encontrado.");
  }

  // Alineacion de la categoria del partido: incluye a los jugadores ascendidos.
  const rosterFilter = (teamId) => ({
    team: teamId,
    $or: [{ category: match.category }, { extraCategory: match.category }]
  });
  const [homePlayers, awayPlayers] = await Promise.all([
    Player.find(rosterFilter(match.homeTeam._id))
      .sort({ lastName: 1, firstName: 1 })
      .lean(),
    Player.find(rosterFilter(match.awayTeam._id))
      .sort({ lastName: 1, firstName: 1 })
      .lean()
  ]);

  const pointsMap = (stats) => {
    const map = {};
    (stats || []).forEach((stat) => {
      map[stat.player.toString()] = stat.points || 0;
    });
    return map;
  };

  const buildLineup = (players, ptsMap) =>
    players
      .map((player) => ({
        id: player._id.toString(),
        fullName: `${player.firstName} ${player.lastName}`,
        category: player.category,
        promoted: player.category !== match.category,
        points: ptsMap[player._id.toString()] || 0
      }))
      .sort((a, b) => b.points - a.points || a.fullName.localeCompare(b.fullName));

  const base = serializeMatch(match);

  res.json({
    ...base,
    homeTeam: {
      ...base.homeTeam,
      coachName: match.homeTeam.coachName,
      lineup: buildLineup(homePlayers, pointsMap(match.homePlayerStats))
    },
    awayTeam: {
      ...base.awayTeam,
      coachName: match.awayTeam.coachName,
      lineup: buildLineup(awayPlayers, pointsMap(match.awayPlayerStats))
    }
  });
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
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  loadResult
};
