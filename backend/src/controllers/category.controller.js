const Category = require("../models/category.model");
const Match = require("../models/match.model");
const Player = require("../models/player.model");
const catchAsync = require("../utils/catchAsync");
const httpError = require("../utils/httpError");

function serialize(category) {
  return {
    id: category._id.toString(),
    name: category.name,
    order: category.order
  };
}

const listCategories = catchAsync(async (_req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  res.json(categories.map(serialize));
});

const createCategory = catchAsync(async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    order: req.body.order ?? 0
  });
  res.status(201).json({
    message: "Categoria creada correctamente.",
    category: serialize(category)
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    throw httpError(404, "Categoria no encontrada.");
  }

  const previousName = category.name;
  category.name = req.body.name ?? category.name;
  category.order = req.body.order ?? category.order;
  await category.save();

  // La categoria se guarda como texto en partidos y jugadores: si cambia el nombre,
  // se actualizan para mantener la consistencia.
  if (req.body.name && req.body.name !== previousName) {
    await Promise.all([
      Match.updateMany({ category: previousName }, { category: req.body.name }),
      Player.updateMany({ category: previousName }, { category: req.body.name })
    ]);
  }

  res.json({
    message: "Categoria actualizada correctamente.",
    category: serialize(category)
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    throw httpError(404, "Categoria no encontrada.");
  }

  const [usedByMatch, usedByPlayer] = await Promise.all([
    Match.exists({ category: category.name }),
    Player.exists({ category: category.name })
  ]);

  if (usedByMatch || usedByPlayer) {
    throw httpError(
      400,
      "No se puede eliminar la categoria porque tiene jugadores o partidos asociados."
    );
  }

  await category.deleteOne();
  res.json({ message: "Categoria eliminada correctamente." });
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
