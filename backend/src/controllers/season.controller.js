const Season = require("../models/season.model");
const Match = require("../models/match.model");
const catchAsync = require("../utils/catchAsync");
const httpError = require("../utils/httpError");

function serialize(season) {
  return {
    id: season._id.toString(),
    name: season.name,
    year: season.year,
    isActive: season.isActive
  };
}

const listSeasons = catchAsync(async (_req, res) => {
  const seasons = await Season.find().sort({ year: -1 }).lean();
  res.json(seasons.map(serialize));
});

const createSeason = catchAsync(async (req, res) => {
  const { name, year } = req.body;
  const isActive = Boolean(req.body.isActive);

  if (isActive) {
    await Season.updateMany({}, { isActive: false });
  }

  const season = await Season.create({ name, year, isActive });
  res.status(201).json({
    message: "Temporada creada correctamente.",
    season: serialize(season)
  });
});

const updateSeason = catchAsync(async (req, res) => {
  const season = await Season.findById(req.params.seasonId);

  if (!season) {
    throw httpError(404, "Temporada no encontrada.");
  }

  season.name = req.body.name ?? season.name;
  season.year = req.body.year ?? season.year;

  if (req.body.isActive === true) {
    await Season.updateMany({ _id: { $ne: season._id } }, { isActive: false });
    season.isActive = true;
  } else if (req.body.isActive === false) {
    season.isActive = false;
  }

  await season.save();
  res.json({
    message: "Temporada actualizada correctamente.",
    season: serialize(season)
  });
});

const activateSeason = catchAsync(async (req, res) => {
  const season = await Season.findById(req.params.seasonId);

  if (!season) {
    throw httpError(404, "Temporada no encontrada.");
  }

  await Season.updateMany({}, { isActive: false });
  season.isActive = true;
  await season.save();

  res.json({ message: "Temporada activada.", season: serialize(season) });
});

const deleteSeason = catchAsync(async (req, res) => {
  const { seasonId } = req.params;
  const hasMatches = await Match.exists({ season: seasonId });

  if (hasMatches) {
    throw httpError(
      400,
      "No se puede eliminar la temporada porque tiene partidos asociados."
    );
  }

  const season = await Season.findByIdAndDelete(seasonId);

  if (!season) {
    throw httpError(404, "Temporada no encontrada.");
  }

  res.json({ message: "Temporada eliminada correctamente." });
});

module.exports = {
  listSeasons,
  createSeason,
  updateSeason,
  activateSeason,
  deleteSeason
};
