const mongoose = require("mongoose");
const dns = require("dns");
const env = require("./env");

async function connectDatabase() {
  if (env.dnsServers.length > 0) {
    dns.setServers(env.dnsServers);
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log("Conexion a MongoDB establecida");
}

module.exports = connectDatabase;
