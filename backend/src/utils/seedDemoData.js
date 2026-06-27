const connectDatabase = require("../config/database");
const ensureDefaultAdmin = require("./ensureDefaultAdmin");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Match = require("../models/match.model");
const Season = require("../models/season.model");
const Category = require("../models/category.model");

// order define como se muestran (U17 primero por defecto). El orden del array se
// mantiene U13->U17 porque la logica de ascensos depende de el.
const demoCategories = [
  { name: "U13", order: 3 },
  { name: "U15", order: 2 },
  { name: "U17", order: 1 }
];
const CATEGORY_NAMES = demoCategories.map((category) => category.name);

const demoSeasons = [
  { name: "Temporada 2024", year: 2024, isActive: false },
  { name: "Temporada 2025", year: 2025, isActive: false },
  { name: "Temporada 2026", year: 2026, isActive: true }
];

const teamDefs = [
  { name: "River Plate", coachName: "Martin Gomez", logoUrl: "/logos/river.svg" },
  { name: "Racing Club", coachName: "Sergio Diaz", logoUrl: "/logos/racing.png" },
  { name: "Independiente", coachName: "Lucas Fernandez", logoUrl: "/logos/independiente.svg" },
  { name: "San Lorenzo", coachName: "Carlos Benitez", logoUrl: "/logos/san-lorenzo.svg" },
  { name: "Velez Sarsfield", coachName: "Raul Medina", logoUrl: "/logos/velez.svg" },
  { name: "Estudiantes de La Plata", coachName: "Pablo Sosa", logoUrl: "/logos/estudiantes.svg" },
  { name: "Gimnasia de La Plata", coachName: "Hernan Rios", logoUrl: "/logos/gimnasia.svg" },
  { name: "Newell's Old Boys", coachName: "Victor Paz", logoUrl: "/logos/newells.svg" },
  { name: "Rosario Central", coachName: "Diego Romero", logoUrl: "/logos/rosario-central.jpg" },
  { name: "Talleres de Cordoba", coachName: "Sebastian Castro", logoUrl: "/logos/talleres.svg" },
  { name: "Belgrano de Cordoba", coachName: "Andres Vega", logoUrl: "/logos/belgrano.svg" },
  { name: "Huracan", coachName: "Nicolas Ponce", logoUrl: "/logos/huracan.svg" }
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

function pad2(value) {
  return String(value).padStart(2, "0");
}

// Cantidad (variable) de jugadores de un equipo en una categoria: entre 9 y 12.
function rosterSize(teamIndex, categoryIndex) {
  return 9 + ((teamIndex * 3 + categoryIndex * 2) % 4);
}

// Asigna ascensos: algunos juveniles juegan tambien en una categoria mayor.
function assignPromotions(playersByCategory, teamIndex) {
  const [u13, u15, u17] = CATEGORY_NAMES; // orden: U13, U15, U17
  const up13to15 = 2 + (teamIndex % 2); // 2-3 suben de U13 a U15
  const up13to17 = 1; // 1 sube de U13 a U17
  const up15to17 = 1 + (teamIndex % 2); // 1-2 suben de U15 a U17

  (playersByCategory[u13] || []).slice(0, up13to15).forEach((p) => {
    p.extraCategory = u15;
  });
  (playersByCategory[u13] || [])
    .slice(up13to15, up13to15 + up13to17)
    .forEach((p) => {
      p.extraCategory = u17;
    });
  (playersByCategory[u15] || []).slice(0, up15to17).forEach((p) => {
    p.extraCategory = u17;
  });
}

// Plantel deterministico por equipo: cantidades variables por categoria y algunos
// jugadores ascendidos a una categoria superior (mas realista).
function buildPlayersByTeam() {
  const byTeam = {};
  let counter = 0;

  teamDefs.forEach((team, teamIndex) => {
    const players = [];
    const byCategory = {};

    CATEGORY_NAMES.forEach((category, categoryIndex) => {
      const size = rosterSize(teamIndex, categoryIndex);
      byCategory[category] = [];
      for (let k = 0; k < size; k += 1) {
        const firstName = FIRST_NAMES[counter % FIRST_NAMES.length];
        // El floor evita que se repita el par (nombre, apellido) dentro del equipo.
        const lastName =
          LAST_NAMES[
            (counter * 7 + Math.floor(counter / FIRST_NAMES.length)) % LAST_NAMES.length
          ];
        const player = { firstName, lastName, category, extraCategory: "" };
        players.push(player);
        byCategory[category].push(player);
        counter += 1;
      }
    });

    assignPromotions(byCategory, teamIndex);
    byTeam[team.name] = players;
  });

  return byTeam;
}

// Devuelve una fecha "YYYY-MM-DD" desplazada `days` dias respecto de `base`.
function shiftDateISO(base, days) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Calendario todos-contra-todos por jornadas (metodo del circulo): en cada jornada
// cada equipo juega UNA sola vez. Devuelve un array de jornadas (cada una con sus
// enfrentamientos [local, visitante]).
function roundRobinRounds(teamNames) {
  const teams = teamNames.slice();
  if (teams.length % 2 === 1) teams.push(null); // equipo "fantasma" = fecha libre
  const n = teams.length;
  const half = n / 2;
  const rounds = [];

  for (let r = 0; r < n - 1; r += 1) {
    const round = [];
    for (let i = 0; i < half; i += 1) {
      const a = teams[i];
      const b = teams[n - 1 - i];
      if (a !== null && b !== null) {
        // Alterna la localia entre jornadas para que no sea siempre el mismo local.
        round.push(r % 2 === 0 ? [a, b] : [b, a]);
      }
    }
    rounds.push(round);
    // Rotar: el primero queda fijo, el resto gira.
    teams.splice(1, 0, teams.pop());
  }

  return rounds;
}

// Genera un fixture (todos contra todos, por jornadas) para un torneo.
// Si se pasa `anchorToday`, las fechas se anclan a hoy: las jornadas pasadas
// quedan jugadas y las futuras programadas (coherencia fecha <-> estado). Si no,
// es un torneo cerrado con fechas en su anio y todos los partidos jugados.
function buildTournamentMatches(teamNames, year, category, monthOffset, playedRatio, anchorToday) {
  const rounds = roundRobinRounds(teamNames);
  const playedRounds = Math.floor(rounds.length * playedRatio);
  const month = pad2(4 + monthOffset);
  const matches = [];

  rounds.forEach((round, r) => {
    const played = r < playedRounds;
    // Fecha: una jornada por dia. Anclada a hoy (activa) o dentro del anio (cerradas).
    const date = anchorToday
      ? shiftDateISO(anchorToday, (r - playedRounds) * 4)
      : `${year}-${month}-${pad2((r % 28) + 1)}`;

    round.forEach((pair, m) => {
      // Semilla para variar resultados por jornada/partido/anio/categoria.
      const seed = r * 17 + m;
      const homeScore = 55 + ((seed * 7 + year * 3 + monthOffset * 13) % 35);
      const awayScore = 55 + ((seed * 11 + year * 5 + monthOffset * 17) % 33);

      matches.push({
        year,
        category,
        home: pair[0],
        away: pair[1],
        date,
        time: ["18:00", "19:30", "21:00"][m % 3],
        venue: VENUES[m % VENUES.length],
        status: played ? "played" : "scheduled",
        homeScore: played ? homeScore : null,
        awayScore: played ? awayScore : null
      });
    });
  });

  return matches;
}

function buildAllMatches() {
  const teamNames = teamDefs.map((team) => team.name);
  const today = new Date();
  const matches = [];

  CATEGORY_NAMES.forEach((category, categoryIndex) => {
    // Temporada activa 2026: fechas ancladas a hoy. Las jornadas anteriores a hoy
    // quedan jugadas (con resultado) y las siguientes, programadas.
    matches.push(
      ...buildTournamentMatches(teamNames, 2026, category, categoryIndex, 0.55, today)
    );
    // Temporadas cerradas: torneo completo de los 12 equipos (para historicos ricos).
    matches.push(
      ...buildTournamentMatches(teamNames, 2025, category, categoryIndex, 1, null)
    );
    matches.push(
      ...buildTournamentMatches(teamNames, 2024, category, categoryIndex, 1, null)
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
      {
        name: teamData.name,
        coachName: teamData.coachName,
        logoUrl: teamData.logoUrl || ""
      },
      { new: true, upsert: true }
    );

    teamIdsByName[team.name] = team._id;

    for (const { firstName, lastName, category, extraCategory } of playersByTeam[
      team.name
    ]) {
      await Player.findOneAndUpdate(
        { firstName, lastName, team: team._id },
        {
          firstName,
          lastName,
          category,
          extraCategory: extraCategory || "",
          team: team._id
        },
        { new: true, upsert: true }
      );
    }
  }

  return teamIdsByName;
}

// Reparte `total` puntos entre los jugadores dados, de forma deterministica y
// realista: pesos decrecientes (goleador, segundo anotador, ...) y `salt` rota
// quien es la figura en cada partido. La suma da exactamente `total`.
function distributePoints(total, playerIds, salt) {
  const n = playerIds.length;
  const stats = playerIds.map((player) => ({ player, points: 0 }));
  if (n === 0 || total <= 0) {
    return stats;
  }

  // Pesos decrecientes: el 1er anotador pesa mucho mas que el ultimo.
  const weights = [];
  for (let i = 0; i < n; i += 1) {
    weights.push(Math.max(1, 24 - i * 5));
  }
  const weightSum = weights.reduce((acc, value) => acc + value, 0);

  // Asigna cada peso a un jugador rotado por `salt` (cambia el goleador).
  let assigned = 0;
  for (let i = 0; i < n; i += 1) {
    const playerIdx = (i + salt) % n;
    const pts = Math.round((total * weights[i]) / weightSum);
    stats[playerIdx].points = pts;
    assigned += pts;
  }

  // La diferencia por redondeo se la queda el goleador del partido.
  const topIdx = salt % n;
  stats[topIdx].points = Math.max(0, stats[topIdx].points + (total - assigned));

  return stats;
}

async function upsertMatches(teamIdsByName, seasonIdsByYear) {
  const matches = buildAllMatches();

  // Plantel por equipo + categoria (para repartir los puntos del marcador).
  // Los ascendidos cuentan tambien en su categoria superior.
  const allPlayers = await Player.find()
    .select("_id team category extraCategory")
    .lean();
  const playersByTeamCat = {};
  const pushPlayer = (teamId, category, playerId) => {
    const key = `${teamId}__${category}`;
    (playersByTeamCat[key] = playersByTeamCat[key] || []).push(playerId);
  };
  allPlayers.forEach((player) => {
    pushPlayer(player.team.toString(), player.category, player._id);
    if (player.extraCategory) {
      pushPlayer(player.team.toString(), player.extraCategory, player._id);
    }
  });

  let idx = 0;
  for (const data of matches) {
    const season = seasonIdsByYear[data.year];
    const homeTeam = teamIdsByName[data.home];
    const awayTeam = teamIdsByName[data.away];

    let homePlayerStats = [];
    let awayPlayerStats = [];
    if (data.status === "played") {
      const homeRoster = playersByTeamCat[`${homeTeam}__${data.category}`] || [];
      const awayRoster = playersByTeamCat[`${awayTeam}__${data.category}`] || [];
      homePlayerStats = distributePoints(data.homeScore, homeRoster, idx * 3 + 1);
      awayPlayerStats = distributePoints(data.awayScore, awayRoster, idx * 5 + 2);
    }

    await Match.findOneAndUpdate(
      {
        season,
        category: data.category,
        homeTeam,
        awayTeam,
        date: data.date,
        time: data.time
      },
      {
        season,
        category: data.category,
        homeTeam,
        awayTeam,
        date: data.date,
        time: data.time,
        venue: data.venue,
        status: data.status,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        homePlayerStats,
        awayPlayerStats
      },
      { new: true, upsert: true }
    );
    idx += 1;
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
