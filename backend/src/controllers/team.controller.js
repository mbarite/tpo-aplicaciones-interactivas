const Match = require("../models/match.model");
const Player = require("../models/player.model");
const Team = require("../models/team.model");
const catchAsync = require("../utils/catchAsync");
const httpError = require("../utils/httpError");
const resolveSeasonId = require("../utils/resolveSeasonId");
const { getTeamDetail } = require("../services/standing.service");

const listTeams = catchAsync(async (_req, res) => {
  const teams = await Team.find().sort({ name: 1 }).lean();
  const players = await Player.find().select("team").lean();

  const playersByTeamId = players.reduce((acc, player) => {
    const key = player.team.toString();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  res.json(
    teams.map((team) => ({
      id: team._id.toString(),
      name: team.name,
      coachName: team.coachName,
      logoUrl: team.logoUrl || "",
      playerCount: playersByTeamId[team._id.toString()] || 0
    }))
  );
});

const getTeamById = catchAsync(async (req, res) => {
  const seasonId = await resolveSeasonId(req.query.season);
  const detail = await getTeamDetail(req.params.teamId, seasonId, req.query.category);
  res.json(detail);
});

const createTeam = catchAsync(async (req, res) => {
  const team = await Team.create({
    name: req.body.name,
    coachName: req.body.coachName,
    logoUrl: req.body.logoUrl || ""
  });

  res.status(201).json({
    message: "Equipo creado correctamente.",
    team: {
      id: team._id.toString(),
      name: team.name,
      coachName: team.coachName,
      logoUrl: team.logoUrl || ""
    }
  });
});

const updateTeam = catchAsync(async (req, res) => {
  const team = await Team.findById(req.params.teamId);

  if (!team) {
    throw httpError(404, "Equipo no encontrado.");
  }

  team.name = req.body.name ?? team.name;
  team.coachName = req.body.coachName ?? team.coachName;
  team.logoUrl = req.body.logoUrl ?? team.logoUrl;
  await team.save();

  res.json({
    message: "Equipo actualizado correctamente.",
    team: {
      id: team._id.toString(),
      name: team.name,
      coachName: team.coachName,
      logoUrl: team.logoUrl || ""
    }
  });
});

const deleteTeam = catchAsync(async (req, res) => {
  const { teamId } = req.params;
  const [team, hasPlayers, hasMatches] = await Promise.all([
    Team.findById(teamId),
    Player.exists({ team: teamId }),
    Match.exists({
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }]
    })
  ]);

  if (!team) {
    throw httpError(404, "Equipo no encontrado.");
  }

  if (hasPlayers || hasMatches) {
    throw httpError(
      400,
      "No se puede eliminar el equipo porque tiene jugadores o partidos asociados."
    );
  }

  await team.deleteOne();

  res.json({
    message: "Equipo eliminado correctamente."
  });
});

module.exports = {
  listTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};
