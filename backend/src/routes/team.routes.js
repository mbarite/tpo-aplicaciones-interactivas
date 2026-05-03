const express = require("express");
const { body, param } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest.middleware");
const {
  listTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} = require("../controllers/team.controller");

const router = express.Router();

router.get("/", listTeams);
router.get(
  "/:teamId",
  [param("teamId").isMongoId().withMessage("El id del equipo no es valido.")],
  validateRequest,
  getTeamById
);

router.post(
  "/",
  authMiddleware,
  [
    body("name").trim().notEmpty().withMessage("El nombre del equipo es obligatorio."),
    body("coachName")
      .trim()
      .notEmpty()
      .withMessage("El nombre del entrenador es obligatorio.")
  ],
  validateRequest,
  createTeam
);

router.put(
  "/:teamId",
  authMiddleware,
  [
    param("teamId").isMongoId().withMessage("El id del equipo no es valido."),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre del equipo no puede estar vacio."),
    body("coachName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre del entrenador no puede estar vacio.")
  ],
  validateRequest,
  updateTeam
);

router.delete(
  "/:teamId",
  authMiddleware,
  [param("teamId").isMongoId().withMessage("El id del equipo no es valido.")],
  validateRequest,
  deleteTeam
);

module.exports = router;
