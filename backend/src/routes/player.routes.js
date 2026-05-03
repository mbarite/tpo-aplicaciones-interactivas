const express = require("express");
const { body, param } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest.middleware");
const {
  listPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer
} = require("../controllers/player.controller");

const router = express.Router();

router.get("/", listPlayers);

router.post(
  "/",
  authMiddleware,
  [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("El nombre del jugador es obligatorio."),
    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("El apellido del jugador es obligatorio."),
    body("category").trim().notEmpty().withMessage("La categoria es obligatoria."),
    body("teamId").isMongoId().withMessage("El equipo seleccionado no es valido.")
  ],
  validateRequest,
  createPlayer
);

router.put(
  "/:playerId",
  authMiddleware,
  [
    param("playerId").isMongoId().withMessage("El id del jugador no es valido."),
    body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre del jugador no puede estar vacio."),
    body("lastName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El apellido del jugador no puede estar vacio."),
    body("category")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("La categoria no puede estar vacia."),
    body("teamId")
      .optional()
      .isMongoId()
      .withMessage("El equipo seleccionado no es valido.")
  ],
  validateRequest,
  updatePlayer
);

router.delete(
  "/:playerId",
  authMiddleware,
  [param("playerId").isMongoId().withMessage("El id del jugador no es valido.")],
  validateRequest,
  deletePlayer
);

module.exports = router;
