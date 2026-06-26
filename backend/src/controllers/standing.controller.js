const catchAsync = require("../utils/catchAsync");
const resolveSeasonId = require("../utils/resolveSeasonId");
const { getStandings, getChampions } = require("../services/standing.service");

const listStandings = catchAsync(async (req, res) => {
  const seasonId = await resolveSeasonId(req.query.season);
  const standings = await getStandings(seasonId, req.query.category);
  res.json(standings);
});

const listChampions = catchAsync(async (_req, res) => {
  const data = await getChampions();
  res.json(data);
});

module.exports = {
  listStandings,
  listChampions
};
