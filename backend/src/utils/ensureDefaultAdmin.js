const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");
const env = require("../config/env");

async function ensureDefaultAdmin() {
  const existingAdmin = await Admin.findOne({ username: env.adminUsername });

  if (existingAdmin) {
    return existingAdmin;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  const admin = await Admin.create({
    username: env.adminUsername,
    passwordHash
  });

  console.log(`Administrador inicial creado: ${admin.username}`);
  return admin;
}

module.exports = ensureDefaultAdmin;
