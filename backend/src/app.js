const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const teamRoutes = require("./routes/team.routes");
const playerRoutes = require("./routes/player.routes");
const matchRoutes = require("./routes/match.routes");
const standingRoutes = require("./routes/standing.routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "API de liga de baloncesto operativa"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/standings", standingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
