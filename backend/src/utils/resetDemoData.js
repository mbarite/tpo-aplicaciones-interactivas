const connectDatabase = require("../config/database");
const ensureDefaultAdmin = require("./ensureDefaultAdmin");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Match = require("../models/match.model");
const { upsertTeams, upsertMatches } = require("./seedDemoData");

async function run() {
  await connectDatabase();
  await ensureDefaultAdmin();

  await Match.deleteMany({});
  await Player.deleteMany({});
  await Team.deleteMany({});

  const teamIdsByName = await upsertTeams();
  await upsertMatches(teamIdsByName);

  console.log("Base demo reiniciada correctamente");
  process.exit(0);
}

run().catch((error) => {
  console.error("No se pudo reiniciar la base demo:", error);
  process.exit(1);
});
