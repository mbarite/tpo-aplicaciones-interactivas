const express = require("express");
const { body, param } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest.middleware");
const {
  listMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  loadResult
} = require("../controllers/match.controller");

const router = express.Router();

router.get("/", listMatches);
router.get("/calendar", (req, _res, next) => {
  req.query.status = "scheduled";
  next();
}, listMatches);
router.get("/results", (req, _res, next) => {
  req.query.status = "played";
  next();
}, listMatches);

router.post(
  "/",
  authMiddleware,
  [
    body("homeTeamId").isMongoId().withMessage("El equipo local no es valido."),
    body("awayTeamId").isMongoId().withMessage("El equipo visitante no es valido."),
    body("date")
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("La fecha debe tener formato YYYY-MM-DD."),
    body("time")
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("La hora debe tener formato HH:mm."),
    body("venue").trim().notEmpty().withMessage("El lugar del partido es obligatorio."),
    body("category").trim().notEmpty().withMessage("La categoria es obligatoria."),
    body("seasonId").optional().isMongoId().withMessage("La temporada no es valida.")
  ],
  validateRequest,
  createMatch
);

router.put(
  "/:matchId",
  authMiddleware,
  [
    param("matchId").isMongoId().withMessage("El id del partido no es valido."),
    body("homeTeamId")
      .optional()
      .isMongoId()
      .withMessage("El equipo local no es valido."),
    body("awayTeamId")
      .optional()
      .isMongoId()
      .withMessage("El equipo visitante no es valido."),
    body("date")
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("La fecha debe tener formato YYYY-MM-DD."),
    body("time")
      .optional()
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("La hora debe tener formato HH:mm."),
    body("venue")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El lugar del partido no puede estar vacio."),
    body("category").optional().trim().notEmpty(),
    body("seasonId").optional().isMongoId()
  ],
  validateRequest,
  updateMatch
);

router.patch(
  "/:matchId/result",
  authMiddleware,
  [
    param("matchId").isMongoId().withMessage("El id del partido no es valido."),
    body("homeScore")
      .isInt({ min: 0 })
      .withMessage("Los puntos del local deben ser un numero entero positivo."),
    body("awayScore")
      .isInt({ min: 0 })
      .withMessage("Los puntos del visitante deben ser un numero entero positivo.")
  ],
  validateRequest,
  loadResult
);

router.delete(
  "/:matchId",
  authMiddleware,
  [param("matchId").isMongoId().withMessage("El id del partido no es valido.")],
  validateRequest,
  deleteMatch
);

module.exports = router;
