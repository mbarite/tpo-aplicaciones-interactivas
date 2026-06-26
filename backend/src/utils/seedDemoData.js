const connectDatabase = require("../config/database");
const ensureDefaultAdmin = require("./ensureDefaultAdmin");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Match = require("../models/match.model");
const Season = require("../models/season.model");
const Category = require("../models/category.model");

const demoCategories = [
  { name: "U15", order: 1 },
  { name: "U17", order: 2 }
];

const demoSeasons = [
  { name: "Temporada 2025", year: 2025, isActive: false },
  { name: "Temporada 2026", year: 2026, isActive: true }
];

const demoTeams = [
  {
    name: "Halcones del Sur",
    coachName: "Mariana Gomez",
    players: [
      ["Tomas", "Rossi", "U17"],
      ["Lucas", "Medina", "U17"],
      ["Joaquin", "Perez", "U17"],
      ["Bruno", "Diaz", "U15"],
      ["Lautaro", "Gimenez", "U15"]
    ]
  },
  {
    name: "Pumas del Oeste",
    coachName: "Sergio Diaz",
    players: [
      ["Franco", "Acosta", "U17"],
      ["Mateo", "Suarez", "U17"],
      ["Thiago", "Vega", "U17"],
      ["Ramiro", "Luna", "U15"],
      ["Felipe", "Costa", "U15"]
    ]
  },
  {
    name: "Tigres del Centro",
    coachName: "Lucia Fernandez",
    players: [
      ["Valentin", "Sosa", "U17"],
      ["Agustin", "Ruiz", "U17"],
      ["Bautista", "Molina", "U17"],
      ["Gael", "Romero", "U15"],
      ["Ciro", "Herrera", "U15"]
    ]
  },
  {
    name: "Leones del Norte",
    coachName: "Carla Benitez",
    players: [
      ["Benjamin", "Aguirre", "U17"],
      ["Santiago", "Ortiz", "U17"],
      ["Ignacio", "Castro", "U17"],
      ["Dylan", "Ferreyra", "U15"],
      ["Noah", "Cabrera", "U15"]
    ]
  }
];

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

  for (const teamData of demoTeams) {
    const team = await Team.findOneAndUpdate(
      { name: teamData.name },
      {
        name: teamData.name,
        coachName: teamData.coachName
      },
      {
        new: true,
        upsert: true
      }
    );

    teamIdsByName[team.name] = team._id;

    for (const [firstName, lastName, category] of teamData.players) {
      await Player.findOneAndUpdate(
        {
          firstName,
          lastName,
          team: team._id
        },
        {
          firstName,
          lastName,
          category,
          team: team._id
        },
        {
          new: true,
          upsert: true
        }
      );
    }
  }

  return teamIdsByName;
}

const demoMatches = [
  // ----- Temporada 2026 (activa) -----
  // U17
  { year: 2026, category: "U17", home: "Halcones del Sur", away: "Pumas del Oeste", date: "2026-05-04", time: "19:00", venue: "Microestadio Sur", status: "played", homeScore: 72, awayScore: 68 },
  { year: 2026, category: "U17", home: "Tigres del Centro", away: "Leones del Norte", date: "2026-05-04", time: "21:00", venue: "Club Centro", status: "played", homeScore: 64, awayScore: 64 },
  { year: 2026, category: "U17", home: "Halcones del Sur", away: "Tigres del Centro", date: "2026-05-08", time: "20:00", venue: "Microestadio Sur", status: "scheduled", homeScore: null, awayScore: null },
  { year: 2026, category: "U17", home: "Pumas del Oeste", away: "Leones del Norte", date: "2026-05-09", time: "18:30", venue: "Polideportivo Oeste", status: "scheduled", homeScore: null, awayScore: null },
  // U15
  { year: 2026, category: "U15", home: "Halcones del Sur", away: "Leones del Norte", date: "2026-05-05", time: "18:00", venue: "Microestadio Sur", status: "played", homeScore: 55, awayScore: 50 },
  { year: 2026, category: "U15", home: "Pumas del Oeste", away: "Tigres del Centro", date: "2026-05-10", time: "17:00", venue: "Polideportivo Oeste", status: "scheduled", homeScore: null, awayScore: null },

  // ----- Temporada 2025 (cerrada, para historicos) -----
  // U17 -> campeon Halcones
  { year: 2025, category: "U17", home: "Halcones del Sur", away: "Pumas del Oeste", date: "2025-05-03", time: "19:00", venue: "Microestadio Sur", status: "played", homeScore: 80, awayScore: 70 },
  { year: 2025, category: "U17", home: "Tigres del Centro", away: "Leones del Norte", date: "2025-05-03", time: "21:00", venue: "Club Centro", status: "played", homeScore: 60, awayScore: 72 },
  { year: 2025, category: "U17", home: "Halcones del Sur", away: "Leones del Norte", date: "2025-05-10", time: "20:00", venue: "Microestadio Sur", status: "played", homeScore: 78, awayScore: 66 },
  // U15 -> campeon Tigres
  { year: 2025, category: "U15", home: "Pumas del Oeste", away: "Tigres del Centro", date: "2025-05-04", time: "18:00", venue: "Polideportivo Oeste", status: "played", homeScore: 49, awayScore: 52 },
  { year: 2025, category: "U15", home: "Pumas del Oeste", away: "Halcones del Sur", date: "2025-05-11", time: "18:00", venue: "Polideportivo Oeste", status: "played", homeScore: 60, awayScore: 58 }
];

async function upsertMatches(teamIdsByName, seasonIdsByYear) {
  for (const data of demoMatches) {
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
      {
        new: true,
        upsert: true
      }
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
