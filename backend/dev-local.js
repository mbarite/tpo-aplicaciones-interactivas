/**
 * Modo de desarrollo local SIN instalar MongoDB.
 *
 * Levanta una base MongoDB temporal en memoria, la llena con los datos de demo
 * (equipos, jugadores, partidos, etc.) y arranca la API normal.
 *
 * Uso:  npm run dev:local
 *
 * Ojo: los datos viven solo mientras el proceso esta corriendo. Al cerrarlo se
 * borran y se vuelven a cargar al iniciar de nuevo. Para datos permanentes o
 * para compartir con otra persona, usa una base real (MongoDB Atlas) via .env.
 */
const { MongoMemoryServer } = require("mongodb-memory-server");

(async () => {
  console.log("Iniciando base MongoDB temporal (la primera vez descarga el motor)...");
  const mem = await MongoMemoryServer.create();
  // Debe setearse ANTES de requerir los modulos que leen la config.
  process.env.MONGO_URI = mem.getUri("liga-baloncesto");

  const connectDatabase = require("./src/config/database");
  const ensureDefaultAdmin = require("./src/utils/ensureDefaultAdmin");
  const seed = require("./src/utils/seedDemoData");
  const app = require("./src/app");
  const env = require("./src/config/env");

  await connectDatabase();
  await ensureDefaultAdmin();

  console.log("Cargando datos de demo...");
  await seed.upsertCategories();
  const seasonIds = await seed.upsertSeasons();
  const teamIds = await seed.upsertTeams();
  await seed.upsertMatches(teamIds, seasonIds);

  app.listen(env.port, () => {
    console.log("\n==================================================");
    console.log(`  API (modo local en memoria) lista`);
    console.log(`  http://localhost:${env.port}/api/health`);
    console.log(`  Admin: ${env.adminUsername} / ${env.adminPassword}`);
    console.log("==================================================\n");
  });

  const shutdown = async () => {
    await mem.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch((error) => {
  console.error("No se pudo iniciar el modo local:", error);
  process.exit(1);
});
