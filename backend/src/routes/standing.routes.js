const express = require("express");
const { listStandings, listChampions } = require("../controllers/standing.controller");

const router = express.Router();

router.get("/champions", listChampions);
router.get("/", listStandings);

module.exports = router;
