const Match = require("../models/match.model");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Season = require("../models/season.model");
const httpError = require("../utils/httpError");
const serializeMatch = require("../utils/serializeMatch");

function emptyStats(team) {
  return {
    teamId: team._id.toString(),
    team: team.name,
    coachName: team.coachName,
    logoUrl: team.logoUrl || "",
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

async function getStandings(seasonId, category) {
  // Filtro del torneo: temporada + categoria (cada combinacion es una tabla propia).
  const baseFilter = {};
  if (seasonId) baseFilter.season = seasonId;
  if (category) baseFilter.category = category;

  const allMatches = await Match.find(baseFilter).lean();

  // Solo participan en la tabla los equipos que tienen partidos en ese torneo.
  const participatingIds = new Set();
  allMatches.forEach((match) => {
    participatingIds.add(match.homeTeam.toString());
    participatingIds.add(match.awayTeam.toString());
  });

  const teams = await Team.find({ _id: { $in: [...participatingIds] } })
    .sort({ name: 1 })
    .lean();

  const statsByTeamId = new Map(
    teams.map((team) => [team._id.toString(), emptyStats(team)])
  );

  allMatches
    .filter((match) => match.status === "played")
    .forEach((match) => applyMatch(statsByTeamId, match));

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

async function getTeamDetail(teamId, seasonId, category) {
  const team = await Team.findById(teamId).lean();

  if (!team) {
    throw httpError(404, "Equipo no encontrado.");
  }

  const playerFilter = { team: teamId };
  if (category) {
    playerFilter.category = category;
  }

  const matchFilter = { $or: [{ homeTeam: teamId }, { awayTeam: teamId }] };
  if (seasonId) {
    matchFilter.season = seasonId;
  }
  if (category) {
    matchFilter.category = category;
  }

  const [players, matches, standings] = await Promise.all([
    Player.find(playerFilter).sort({ lastName: 1, firstName: 1 }).lean(),
    Match.find(matchFilter)
      .populate("homeTeam", "name")
      .populate("awayTeam", "name")
      .sort({ date: 1, time: 1 })
      .lean(),
    getStandings(seasonId, category)
  ]);

  // Puntos por jugador, sumados a partir de las estadisticas de los partidos jugados.
  const pointsByPlayerId = {};
  matches
    .filter((match) => match.status === "played")
    .forEach((match) => {
      const isHome = match.homeTeam._id.toString() === teamId.toString();
      const stats = isHome ? match.homePlayerStats : match.awayPlayerStats;
      (stats || []).forEach((stat) => {
        const key = stat.player.toString();
        pointsByPlayerId[key] = (pointsByPlayerId[key] || 0) + (stat.points || 0);
      });
    });

  const currentStanding =
    standings.find((item) => item.teamId === teamId.toString()) || {
      position: null,
      ...emptyStats(team)
    };

  return {
    id: team._id.toString(),
    name: team.name,
    coachName: team.coachName,
    logoUrl: team.logoUrl || "",
    standings: currentStanding,
    players: players
      .map((player) => ({
        id: player._id.toString(),
        firstName: player.firstName,
        lastName: player.lastName,
        fullName: `${player.firstName} ${player.lastName}`,
        category: player.category,
        points: pointsByPlayerId[player._id.toString()] || 0
      }))
      .sort((a, b) => b.points - a.points || a.fullName.localeCompare(b.fullName)),
    playedMatches: matches
      .filter((match) => match.status === "played")
      .map(serializeMatch),
    pendingMatches: matches
      .filter((match) => match.status === "scheduled")
      .map(serializeMatch)
  };
}

// Campeones / palmares: por cada temporada y categoria con partidos jugados,
// el equipo que quedo 1ro. Ademas, el conteo de titulos por equipo.
async function getChampions() {
  const seasons = await Season.find().sort({ year: -1 }).lean();
  const champions = [];

  for (const season of seasons) {
    const categories = await Match.distinct("category", {
      season: season._id,
      status: "played"
    });

    for (const category of categories) {
      const standings = await getStandings(season._id.toString(), category);
      const top = standings.find((row) => row.position === 1 && row.played > 0);

      if (top) {
        champions.push({
          seasonId: season._id.toString(),
          season: season.name,
          year: season.year,
          seasonActive: season.isActive,
          category,
          teamId: top.teamId,
          team: top.team,
          logoUrl: top.logoUrl,
          points: top.points
        });
      }
    }
  }

  const titlesByTeam = {};
  champions
    .filter((item) => !item.seasonActive) // solo temporadas cerradas cuentan como titulo
    .forEach((item) => {
      if (!titlesByTeam[item.teamId]) {
        titlesByTeam[item.teamId] = {
          teamId: item.teamId,
          team: item.team,
          logoUrl: item.logoUrl,
          titles: 0
        };
      }
      titlesByTeam[item.teamId].titles += 1;
    });

  const palmares = Object.values(titlesByTeam).sort(
    (a, b) => b.titles - a.titles || a.team.localeCompare(b.team)
  );

  return { champions, palmares };
}

module.exports = {
  getStandings,
  getTeamDetail,
  getChampions
};
