const Match = require("../models/match.model");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
const httpError = require("../utils/httpError");
const serializeMatch = require("../utils/serializeMatch");

function emptyStats(team) {
  return {
    teamId: team._id.toString(),
    team: team.name,
    coachName: team.coachName,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointDifference: 0
  };
}

function applyMatch(statsByTeamId, match) {
  const homeId = match.homeTeam.toString();
  const awayId = match.awayTeam.toString();
  const home = statsByTeamId.get(homeId);
  const away = statsByTeamId.get(awayId);

  if (!home || !away || match.homeScore === null || match.awayScore === null) {
    return;
  }

  home.played += 1;
  away.played += 1;

  home.pointsFor += match.homeScore;
  home.pointsAgainst += match.awayScore;
  away.pointsFor += match.awayScore;
  away.pointsAgainst += match.homeScore;

  if (match.homeScore > match.awayScore) {
    home.won += 1;
    home.points += 3;
    away.lost += 1;
  } else if (match.homeScore < match.awayScore) {
    away.won += 1;
    away.points += 3;
    home.lost += 1;
  } else {
    home.drawn += 1;
    away.drawn += 1;
    home.points += 1;
    away.points += 1;
  }

  home.pointDifference = home.pointsFor - home.pointsAgainst;
  away.pointDifference = away.pointsFor - away.pointsAgainst;
}

async function getStandings() {
  const [teams, matches] = await Promise.all([
    Team.find().sort({ name: 1 }).lean(),
    Match.find({ status: "played" }).lean()
  ]);

  const statsByTeamId = new Map(
    teams.map((team) => [team._id.toString(), emptyStats(team)])
  );

  matches.forEach((match) => applyMatch(statsByTeamId, match));

  return Array.from(statsByTeamId.values())
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.pointDifference !== a.pointDifference) {
        return b.pointDifference - a.pointDifference;
      }

      if (b.pointsFor !== a.pointsFor) {
        return b.pointsFor - a.pointsFor;
      }

      return a.team.localeCompare(b.team);
    })
    .map((row, index) => ({
      position: index + 1,
      ...row
    }));
}

async function getTeamDetail(teamId) {
  const team = await Team.findById(teamId).lean();

  if (!team) {
    throw httpError(404, "Equipo no encontrado.");
  }

  const [players, matches, standings] = await Promise.all([
    Player.find({ team: teamId }).sort({ lastName: 1, firstName: 1 }).lean(),
    Match.find({
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }]
    })
      .populate("homeTeam", "name")
      .populate("awayTeam", "name")
      .sort({ date: 1, time: 1 })
      .lean(),
    getStandings()
  ]);

  const currentStanding =
    standings.find((item) => item.teamId === teamId.toString()) || {
      position: null,
      ...emptyStats(team)
    };

  return {
    id: team._id.toString(),
    name: team.name,
    coachName: team.coachName,
    standings: currentStanding,
    players: players.map((player) => ({
      id: player._id.toString(),
      firstName: player.firstName,
      lastName: player.lastName,
      fullName: `${player.firstName} ${player.lastName}`,
      category: player.category
    })),
    playedMatches: matches
      .filter((match) => match.status === "played")
      .map(serializeMatch),
    pendingMatches: matches
      .filter((match) => match.status === "scheduled")
      .map(serializeMatch)
  };
}

module.exports = {
  getStandings,
  getTeamDetail
};
