const express = require("express");
const { body, param } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest.middleware");
const {
  listSeasons,
  createSeason,
  updateSeason,
  activateSeason,
  deleteSeason
} = require("../controllers/season.controller");

const router = express.Router();

router.get("/", listSeasons);

router.post(
  "/",
  authMiddleware,
  [
    body("name").trim().notEmpty().withMessage("El nombre de la temporada es obligatorio."),
    body("year")
      .isInt({ min: 1900, max: 2200 })
      .withMessage("El anio debe ser un numero valido.")
  ],
  validateRequest,
  createSeason
);

router.put(
  "/:seasonId",
  authMiddleware,
  [
    param("seasonId").isMongoId().withMessage("El id de la temporada no es valido."),
    body("name").optional().trim().notEmpty(),
    body("year").optional().isInt({ min: 1900, max: 2200 }),
    body("isActive").optional().isBoolean()
  ],
  validateRequest,
  updateSeason
);

router.patch(
  "/:seasonId/activate",
  authMiddleware,
  [param("seasonId").isMongoId().withMessage("El id de la temporada no es valido.")],
  validateRequest,
  activateSeason
);

router.delete(
  "/:seasonId",
  authMiddleware,
  [param("seasonId").isMongoId().withMessage("El id de la temporada no es valido.")],
  validateRequest,
  deleteSeason
);

module.exports = router;
