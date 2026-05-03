const Match = require("../models/match.model");
const Team = require("../models/team.model");
const catchAsync = require("../utils/catchAsync");
const httpError = require("../utils/httpError");
const serializeMatch = require("../utils/serializeMatch");

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

  const matches = await Match.find(filter)
    .populate("homeTeam", "name")
    .populate("awayTeam", "name")
    .sort({ date: 1, time: 1 })
    .lean();

  res.json(matches.map(serializeMatch));
});

const createMatch = catchAsync(async (req, res) => {
  const { homeTeamId, awayTeamId, date, time, venue } = req.body;
  await validateTeams(homeTeamId, awayTeamId);

  const match = await Match.create({
    homeTeam: homeTeamId,
    awayTeam: awayTeamId,
    date,
    time,
    venue
  });

  await match.populate("homeTeam", "name");
  await match.populate("awayTeam", "name");

  res.status(201).json({
    message: "Partido creado correctamente.",
    match: serializeMatch(match)
  });
});

const updateMatch = catchAsync(async (req, res) => {
  const { matchId } = req.params;
  const { homeTeamId, awayTeamId, date, time, venue } = req.body;
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

  await match.save();
  await match.populate("homeTeam", "name");
  await match.populate("awayTeam", "name");

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

  await match.save();
  await match.populate("homeTeam", "name");
  await match.populate("awayTeam", "name");

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
