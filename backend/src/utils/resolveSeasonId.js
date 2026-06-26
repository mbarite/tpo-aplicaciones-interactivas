const Season = require("../models/season.model");

// Devuelve el id de temporada a usar: el solicitado (query) o, si no, la temporada
// activa. Si no hay temporadas, devuelve null (las consultas no filtran por temporada).
async function resolveSeasonId(requested) {
  if (requested) {
    return requested;
  }
  const active = await Season.findOne({ isActive: true }).lean();
  return active ? active._id.toString() : null;
}

module.exports = resolveSeasonId;
