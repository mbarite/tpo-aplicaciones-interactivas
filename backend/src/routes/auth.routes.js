const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest.middleware");
const { login, me } = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("El usuario es obligatorio."),
    body("password").notEmpty().withMessage("La contrasena es obligatoria.")
  ],
  validateRequest,
  login
);

router.get("/me", authMiddleware, me);

module.exports = router;
