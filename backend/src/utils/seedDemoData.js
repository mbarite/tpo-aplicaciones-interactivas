const connectDatabase = require("../config/database");
const ensureDefaultAdmin = require("./ensureDefaultAdmin");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Match = require("../models/match.model");

const demoTeams = [
  {
    name: "Halcones del Sur",
    coachName: "Mariana Gomez",
    players: [
      ["Tomas", "Rossi", "U17"],
      ["Lucas", "Medina", "U17"],
      ["Joaquin", "Perez", "U17"]
    ]
  },
  {
    name: "Pumas del Oeste",
    coachName: "Sergio Diaz",
    players: [
      ["Franco", "Acosta", "U17"],
      ["Mateo", "Suarez", "U17"],
      ["Thiago", "Vega", "U17"]
    ]
  },
  {
    name: "Tigres del Centro",
    coachName: "Lucia Fernandez",
    players: [
      ["Valentin", "Sosa", "U17"],
      ["Agustin", "Ruiz", "U17"],
      ["Bautista", "Molina", "U17"]
    ]
  },
  {
    name: "Leones del Norte",
    coachName: "Carla Benitez",
    players: [
      ["Benjamin", "Aguirre", "U17"],
      ["Santiago", "Ortiz", "U17"],
      ["Ignacio", "Castro", "U17"]
    ]
  }
];

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

async function upsertMatches(teamIdsByName) {
  const demoMatches = [
    {
      homeTeam: "Halcones del Sur",
      awayTeam: "Pumas del Oeste",
      date: "2026-05-04",
      time: "19:00",
      venue: "Microestadio Sur",
      status: "played",
      homeScore: 72,
      awayScore: 68
    },
    {
      homeTeam: "Tigres del Centro",
      awayTeam: "Leones del Norte",
      date: "2026-05-04",
      time: "21:00",
      venue: "Club Centro",
      status: "played",
      homeScore: 64,
      awayScore: 64
    },
    {
      homeTeam: "Halcones del Sur",
      awayTeam: "Tigres del Centro",
      date: "2026-05-08",
      time: "20:00",
      venue: "Microestadio Sur",
      status: "scheduled",
      homeScore: null,
      awayScore: null
    },
    {
      homeTeam: "Pumas del Oeste",
      awayTeam: "Leones del Norte",
      date: "2026-05-09",
      time: "18:30",
      venue: "Polideportivo Oeste",
      status: "scheduled",
      homeScore: null,
      awayScore: null
    }
  ];

  for (const matchData of demoMatches) {
    await Match.findOneAndUpdate(
      {
        homeTeam: teamIdsByName[matchData.homeTeam],
        awayTeam: teamIdsByName[matchData.awayTeam],
        date: matchData.date,
        time: matchData.time
      },
      {
        homeTeam: teamIdsByName[matchData.homeTeam],
        awayTeam: teamIdsByName[matchData.awayTeam],
        date: matchData.date,
        time: matchData.time,
        venue: matchData.venue,
        status: matchData.status,
        homeScore: matchData.homeScore,
        awayScore: matchData.awayScore
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

  const teamIdsByName = await upsertTeams();
  await upsertMatches(teamIdsByName);

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
  upsertTeams,
  upsertMatches
};
