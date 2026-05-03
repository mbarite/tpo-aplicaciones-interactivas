const Player = require("../models/player.model");
const Team = require("../models/team.model");
const catchAsync = require("../utils/catchAsync");
const httpError = require("../utils/httpError");

const listPlayers = catchAsync(async (_req, res) => {
  const players = await Player.find()
    .populate("team", "name")
    .sort({ lastName: 1, firstName: 1 })
    .lean();

  res.json(
    players.map((player) => ({
      id: player._id.toString(),
      firstName: player.firstName,
      lastName: player.lastName,
      fullName: `${player.firstName} ${player.lastName}`,
      category: player.category,
      team: player.team
        ? {
            id: player.team._id.toString(),
            name: player.team.name
          }
        : null
    }))
  );
});

const createPlayer = catchAsync(async (req, res) => {
  const { firstName, lastName, category, teamId } = req.body;
  const team = await Team.findById(teamId);

  if (!team) {
    throw httpError(404, "Equipo no encontrado.");
  }

  const player = await Player.create({
    firstName,
    lastName,
    category,
    team: teamId
  });

  res.status(201).json({
    message: "Jugador creado correctamente.",
    player: {
      id: player._id.toString(),
      firstName: player.firstName,
      lastName: player.lastName,
      fullName: `${player.firstName} ${player.lastName}`,
      category: player.category,
      team: {
        id: team._id.toString(),
        name: team.name
      }
    }
  });
});

const updatePlayer = catchAsync(async (req, res) => {
  const { playerId } = req.params;
  const { firstName, lastName, category, teamId } = req.body;
  const player = await Player.findById(playerId);

  if (!player) {
    throw httpError(404, "Jugador no encontrado.");
  }

  if (teamId) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw httpError(404, "Equipo no encontrado.");
    }

    player.team = teamId;
  }

  player.firstName = firstName ?? player.firstName;
  player.lastName = lastName ?? player.lastName;
  player.category = category ?? player.category;

  await player.save();
  await player.populate("team", "name");

  res.json({
    message: "Jugador actualizado correctamente.",
    player: {
      id: player._id.toString(),
      firstName: player.firstName,
      lastName: player.lastName,
      fullName: `${player.firstName} ${player.lastName}`,
      category: player.category,
      team: {
        id: player.team._id.toString(),
        name: player.team.name
      }
    }
  });
});

const deletePlayer = catchAsync(async (req, res) => {
  const player = await Player.findById(req.params.playerId);

  if (!player) {
    throw httpError(404, "Jugador no encontrado.");
  }

  await player.deleteOne();

  res.json({
    message: "Jugador eliminado correctamente."
  });
});

module.exports = {
  listPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer
};
