const connectDatabase = require("../config/database");
const ensureDefaultAdmin = require("./ensureDefaultAdmin");
const Team = require("../models/team.model");
const Player = require("../models/player.model");
const Match = require("../models/match.model");
const Season = require("../models/season.model");
const Category = require("../models/category.model");
const {
  upsertCategories,
  upsertSeasons,
  upsertTeams,
  upsertMatches
} = require("./seedDemoData");

async function run() {
  await connectDatabase();
  await ensureDefaultAdmin();

  await Match.deleteMany({});
  await Player.deleteMany({});
  await Team.deleteMany({});
  await Season.deleteMany({});
  await Category.deleteMany({});

  await upsertCategories();
  const seasonIdsByYear = await upsertSeasons();
  const teamIdsByName = await upsertTeams();
  await upsertMatches(teamIdsByName, seasonIdsByYear);

  console.log("Base demo reiniciada correctamente");
  process.exit(0);
}

run().catch((error) => {
  console.error("No se pudo reiniciar la base demo:", error);
  process.exit(1);
});
