const express = require("express");
const { body, param } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest.middleware");
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/category.controller");

const router = express.Router();

router.get("/", listCategories);

router.post(
  "/",
  authMiddleware,
  [
    body("name").trim().notEmpty().withMessage("El nombre de la categoria es obligatorio."),
    body("order").optional().isInt().withMessage("El orden debe ser un numero.")
  ],
  validateRequest,
  createCategory
);

router.put(
  "/:categoryId",
  authMiddleware,
  [
    param("categoryId").isMongoId().withMessage("El id de la categoria no es valido."),
    body("name").optional().trim().notEmpty(),
    body("order").optional().isInt()
  ],
  validateRequest,
  updateCategory
);

router.delete(
  "/:categoryId",
  authMiddleware,
  [param("categoryId").isMongoId().withMessage("El id de la categoria no es valido.")],
  validateRequest,
  deleteCategory
);

module.exports = router;
