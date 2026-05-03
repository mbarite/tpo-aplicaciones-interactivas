const connectDatabase = require("../config/database");
const ensureDefaultAdmin = require("./ensureDefaultAdmin");

async function run() {
  await connectDatabase();
  await ensureDefaultAdmin();
  console.log("Seed de administrador finalizado");
  process.exit(0);
}

run().catch((error) => {
  console.error("No se pudo ejecutar el seed de administrador:", error);
  process.exit(1);
});
