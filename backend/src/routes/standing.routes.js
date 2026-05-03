const express = require("express");
const { listStandings } = require("../controllers/standing.controller");

const router = express.Router();

router.get("/", listStandings);

module.exports = router;
