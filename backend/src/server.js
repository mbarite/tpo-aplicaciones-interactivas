const app = require("./app");
const connectDatabase = require("./config/database");
const env = require("./config/env");
const ensureDefaultAdmin = require("./utils/ensureDefaultAdmin");

async function bootstrap() {
  await connectDatabase();
  await ensureDefaultAdmin();

  app.listen(env.port, () => {
    console.log(`Servidor escuchando en http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("No se pudo iniciar la API:", error);
  process.exit(1);
});
