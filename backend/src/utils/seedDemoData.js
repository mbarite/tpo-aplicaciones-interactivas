const connectDatabase = require("../config/database");
const ensureDefaultAdmin = require("./ensureDefaultAdmin");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Match = require("../models/match.model");
const Season = require("../models/season.model");
const Category = require("../models/category.model");

const demoCategories = [
  { name: "U13", order: 1 },
  { name: "U15", order: 2 },
  { name: "U17", order: 3 }
];
const CATEGORY_NAMES = demoCategories.map((category) => category.name);

const demoSeasons = [
  { name: "Temporada 2024", year: 2024, isActive: false },
  { name: "Temporada 2025", year: 2025, isActive: false },
  { name: "Temporada 2026", year: 2026, isActive: true }
];

const teamDefs = [
  { name: "Halcones del Sur", coachName: "Mariana Gomez" },
  { name: "Pumas del Oeste", coachName: "Sergio Diaz" },
  { name: "Tigres del Centro", coachName: "Lucia Fernandez" },
  { name: "Leones del Norte", coachName: "Carla Benitez" },
  { name: "Condores del Alto", coachName: "Raul Medina" },
  { name: "Jaguares del Rio", coachName: "Paula Sosa" },
  { name: "Toros del Valle", coachName: "Hernan Rios" },
  { name: "Lobos del Lago", coachName: "Veronica Paz" }
];

const FIRST_NAMES = [
  "Tomas", "Lucas", "Joaquin", "Bruno", "Lautaro", "Franco", "Mateo", "Thiago",
  "Ramiro", "Felipe", "Valentin", "Agustin", "Bautista", "Gael", "Ciro",
  "Benjamin", "Santiago", "Ignacio", "Dylan", "Noah", "Tobias", "Lorenzo",
  "Simon", "Dante"
];
const LAST_NAMES = [
  "Rossi", "Medina", "Perez", "Diaz", "Gimenez", "Acosta", "Suarez", "Vega",
  "Luna", "Costa", "Sosa", "Ruiz", "Molina", "Romero", "Herrera", "Aguirre",
  "Ortiz", "Castro", "Ferreyra", "Cabrera", "Gomez", "Silva", "Torres", "Rios"
];

const VENUES = [
  "Microestadio Sur",
  "Club Centro",
  "Polideportivo Oeste",
  "Estadio Norte",
  "Gimnasio Municipal"
];

const PLAYERS_PER_CATEGORY = 5;

function pad2(value) {
  return String(value).padStart(2, "0");
}

// Plantel deterministico por equipo: PLAYERS_PER_CATEGORY jugadores en cada categoria.
function buildPlayersByTeam() {
  const byTeam = {};
  let counter = 0;

  teamDefs.forEach((team) => {
    const players = [];
    CATEGORY_NAMES.forEach((category) => {
      for (let k = 0; k < PLAYERS_PER_CATEGORY; k += 1) {
        const firstName = FIRST_NAMES[counter % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(counter * 7) % LAST_NAMES.length];
        players.push([firstName, lastName, category]);
        counter += 1;
      }
    });
    byTeam[team.name] = players;
  });

  return byTeam;
}

// Genera un fixture (todos contra todos) para un torneo (temporada + categoria).
function buildTournamentMatches(teamNames, year, category, monthOffset, playedRatio) {
  const pairs = [];
  for (let i = 0; i < teamNames.length; i += 1) {
    for (let j = i + 1; j < teamNames.length; j += 1) {
      pairs.push([teamNames[i], teamNames[j]]);
    }
  }

  const month = pad2(4 + monthOffset);
  const playedUntil = Math.floor(pairs.length * playedRatio);

  return pairs.map((pair, idx) => {
    const played = idx < playedUntil;
    const homeScore = 55 + ((idx * 7) % 35);
    const awayScore = 55 + ((idx * 11) % 33);
    return {
      year,
      category,
      home: pair[0],
      away: pair[1],
      date: `${year}-${month}-${pad2((idx % 28) + 1)}`,
      time: ["18:00", "20:00", "21:00"][idx % 3],
      venue: VENUES[idx % VENUES.length],
      status: played ? "played" : "scheduled",
      homeScore: played ? homeScore : null,
      awayScore: played ? awayScore : null
    };
  });
}

function buildAllMatches() {
  const teamNames = teamDefs.map((team) => team.name);
  const topFour = teamNames.slice(0, 4);
  const matches = [];

  CATEGORY_NAMES.forEach((category, categoryIndex) => {
    // Temporada activa 2026: todos los equipos, mitad jugada / mitad por jugar.
    matches.push(
      ...buildTournamentMatches(teamNames, 2026, category, categoryIndex, 0.55)
    );
    // Temporadas cerradas: torneo de los 4 primeros, completo (para historicos).
    matches.push(
      ...buildTournamentMatches(topFour, 2025, category, categoryIndex, 1)
    );
    matches.push(
      ...buildTournamentMatches(topFour, 2024, category, categoryIndex, 1)
    );
  });

  return matches;
}

async function upsertCategories() {
  for (const category of demoCategories) {
    await Category.findOneAndUpdate({ name: category.name }, category, {
      new: true,
      upsert: true
    });
  }
}

async function upsertSeasons() {
  const seasonIdsByYear = {};
  for (const season of demoSeasons) {
    const doc = await Season.findOneAndUpdate({ name: season.name }, season, {
      new: true,
      upsert: true
    });
    seasonIdsByYear[season.year] = doc._id;
  }
  return seasonIdsByYear;
}

async function upsertTeams() {
  const teamIdsByName = {};
  const playersByTeam = buildPlayersByTeam();

  for (const teamData of teamDefs) {
    const team = await Team.findOneAndUpdate(
      { name: teamData.name },
      { name: teamData.name, coachName: teamData.coachName },
      { new: true, upsert: true }
    );

    teamIdsByName[team.name] = team._id;

    for (const [firstName, lastName, category] of playersByTeam[team.name]) {
      await Player.findOneAndUpdate(
        { firstName, lastName, team: team._id },
        { firstName, lastName, category, team: team._id },
        { new: true, upsert: true }
      );
    }
  }

  return teamIdsByName;
}

async function upsertMatches(teamIdsByName, seasonIdsByYear) {
  const matches = buildAllMatches();

  for (const data of matches) {
    const season = seasonIdsByYear[data.year];
    await Match.findOneAndUpdate(
      {
        season,
        category: data.category,
        homeTeam: teamIdsByName[data.home],
        awayTeam: teamIdsByName[data.away],
        date: data.date,
        time: data.time
      },
      {
        season,
        category: data.category,
        homeTeam: teamIdsByName[data.home],
        awayTeam: teamIdsByName[data.away],
        date: data.date,
        time: data.time,
        venue: data.venue,
        status: data.status,
        homeScore: data.homeScore,
        awayScore: data.awayScore
      },
      { new: true, upsert: true }
    );
  }
}

async function run() {
  await connectDatabase();
  await ensureDefaultAdmin();

  await upsertCategories();
  const seasonIdsByYear = await upsertSeasons();
  const teamIdsByName = await upsertTeams();
  await upsertMatches(teamIdsByName, seasonIdsByYear);

  console.log("Datos demo cargados correctamente");
  process.exit(0);
}

if (require.main === module) {
  run().catch((error) => {
    console.error("No se pudieron cargar los datos demo:", error);
    process.exit(1);
  });
}

module.exports = {
  upsertCategories,
  upsertSeasons,
  upsertTeams,
  upsertMatches
};
