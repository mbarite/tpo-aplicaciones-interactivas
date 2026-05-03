const catchAsync = require("../utils/catchAsync");
const { getStandings } = require("../services/standing.service");

const listStandings = catchAsync(async (_req, res) => {
  const standings = await getStandings();
  res.json(standings);
});

module.exports = {
  listStandings
};
