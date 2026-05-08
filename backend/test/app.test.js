const assert = require("node:assert/strict");
const { once } = require("node:events");
const { after, before, beforeEach, test } = require("node:test");

const app = require("../src/app");
const Team = require("../src/models/team.model");
const Player = require("../src/models/player.model");
const Match = require("../src/models/match.model");
const { signAdminToken } = require("../src/utils/jwt");

const ADMIN_TOKEN = signAdminToken({
  _id: "507f191e810c19729de860ff",
  username: "admin"
});

const EXISTING_HOME_TEAM_ID = "507f191e810c19729de860ea";
const EXISTING_AWAY_TEAM_ID = "507f191e810c19729de860eb";
const OTHER_TEAM_ID = "507f191e810c19729de860ec";
const MATCH_ID = "507f191e810c19729de860ed";
const PLAYER_ID = "507f191e810c19729de860ee";

let server;
let baseUrl;

function createQuery(result) {
  return {
    sort() {
      return this;
    },
    select() {
      return this;
    },
    populate() {
      return this;
    },
    lean: async () => result
  };
}

function unexpectedQuery(methodName) {
  return {
    sort() {
      return this;
    },
    select() {
      return this;
    },
    populate() {
      return this;
    },
    lean: async () => {
      throw new Error(`Unexpected call to ${methodName}`);
    }
  };
}

function fail(methodName) {
  return async () => {
    throw new Error(`Unexpected call to ${methodName}`);
  };
}

function resetModelStubs() {
  Team.find = () => unexpectedQuery("Team.find");
  Team.findById = fail("Team.findById");
  Team.create = fail("Team.create");

  Player.find = () => unexpectedQuery("Player.find");
  Player.findById = fail("Player.findById");
  Player.create = fail("Player.create");
  Player.exists = fail("Player.exists");

  Match.find = () => unexpectedQuery("Match.find");
  Match.findById = fail("Match.findById");
  Match.create = fail("Match.create");
  Match.exists = fail("Match.exists");
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  return {
    status: response.status,
    body: payload
  };
}

before(async () => {
  server = app.listen(0);
  await once(server, "listening");

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  server.close();
  await once(server, "close");
});

beforeEach(() => {
  resetModelStubs();
});

test("blocks private routes when the token is missing", async () => {
  const response = await request("/api/teams", {
    method: "POST",
    body: {
      name: "Panteras del Este",
      coachName: "Julieta Romero"
    }
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "No autorizado. Debe enviar un token Bearer.");
});

test("rejects creating a match when the same team is used twice", async () => {
  const response = await request("/api/matches", {
    method: "POST",
    token: ADMIN_TOKEN,
    body: {
      homeTeamId: EXISTING_HOME_TEAM_ID,
      awayTeamId: EXISTING_HOME_TEAM_ID,
      date: "2026-05-10",
      time: "20:30",
      venue: "Club Central"
    }
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, "El equipo local y visitante deben ser distintos.");
});

test("rejects creating a match when one team does not exist", async () => {
  Team.find = () =>
    createQuery([
      {
        _id: EXISTING_HOME_TEAM_ID,
        name: "Halcones del Sur"
      }
    ]);

  const response = await request("/api/matches", {
    method: "POST",
    token: ADMIN_TOKEN,
    body: {
      homeTeamId: EXISTING_HOME_TEAM_ID,
      awayTeamId: OTHER_TEAM_ID,
      date: "2026-05-10",
      time: "20:30",
      venue: "Club Central"
    }
  });

  assert.equal(response.status, 404);
  assert.equal(response.body.message, "Alguno de los equipos seleccionados no existe.");
});

test("rejects updating a match when both teams become the same", async () => {
  Match.findById = async () => ({
    _id: MATCH_ID,
    homeTeam: { toString: () => EXISTING_HOME_TEAM_ID },
    awayTeam: { toString: () => EXISTING_AWAY_TEAM_ID }
  });

  const response = await request(`/api/matches/${MATCH_ID}`, {
    method: "PUT",
    token: ADMIN_TOKEN,
    body: {
      homeTeamId: EXISTING_AWAY_TEAM_ID,
      awayTeamId: EXISTING_AWAY_TEAM_ID
    }
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, "El equipo local y visitante deben ser distintos.");
});

test("validates that result scores are non-negative integers", async () => {
  const response = await request(`/api/matches/${MATCH_ID}/result`, {
    method: "PATCH",
    token: ADMIN_TOKEN,
    body: {
      homeScore: -1,
      awayScore: 77
    }
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, "Hay errores de validacion.");
  assert.deepEqual(response.body.errors, [
    {
      field: "homeScore",
      message: "Los puntos del local deben ser un numero entero positivo."
    }
  ]);
});

test("rejects creating a player when the selected team does not exist", async () => {
  Team.findById = async () => null;

  const response = await request("/api/players", {
    method: "POST",
    token: ADMIN_TOKEN,
    body: {
      firstName: "Nicolas",
      lastName: "Dominguez",
      category: "U17",
      teamId: EXISTING_HOME_TEAM_ID
    }
  });

  assert.equal(response.status, 404);
  assert.equal(response.body.message, "Equipo no encontrado.");
});

test("rejects updating a player when the target team does not exist", async () => {
  Player.findById = async () => ({
    _id: PLAYER_ID,
    firstName: "Nicolas",
    lastName: "Dominguez",
    category: "U17",
    team: { _id: EXISTING_HOME_TEAM_ID, name: "Halcones del Sur" },
    save: async () => {},
    populate: async () => {}
  });

  Team.findById = async () => null;

  const response = await request(`/api/players/${PLAYER_ID}`, {
    method: "PUT",
    token: ADMIN_TOKEN,
    body: {
      teamId: OTHER_TEAM_ID
    }
  });

  assert.equal(response.status, 404);
  assert.equal(response.body.message, "Equipo no encontrado.");
});

test("returns 404 when trying to delete a player that does not exist", async () => {
  Player.findById = async () => null;

  const response = await request(`/api/players/${PLAYER_ID}`, {
    method: "DELETE",
    token: ADMIN_TOKEN
  });

  assert.equal(response.status, 404);
  assert.equal(response.body.message, "Jugador no encontrado.");
});

test("validates required team data before creating a team", async () => {
  const response = await request("/api/teams", {
    method: "POST",
    token: ADMIN_TOKEN,
    body: {
      name: "",
      coachName: ""
    }
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, "Hay errores de validacion.");
  assert.deepEqual(response.body.errors, [
    {
      field: "name",
      message: "El nombre del equipo es obligatorio."
    },
    {
      field: "coachName",
      message: "El nombre del entrenador es obligatorio."
    }
  ]);
});

test("returns 404 when trying to update a team that does not exist", async () => {
  Team.findById = async () => null;

  const response = await request(`/api/teams/${EXISTING_HOME_TEAM_ID}`, {
    method: "PUT",
    token: ADMIN_TOKEN,
    body: {
      coachName: "Nuevo Entrenador"
    }
  });

  assert.equal(response.status, 404);
  assert.equal(response.body.message, "Equipo no encontrado.");
});

test("blocks deleting a team that still has players or matches associated", async () => {
  Team.findById = async () => ({
    _id: EXISTING_HOME_TEAM_ID,
    name: "Halcones del Sur"
  });
  Player.exists = async () => true;
  Match.exists = async () => false;

  const response = await request(`/api/teams/${EXISTING_HOME_TEAM_ID}`, {
    method: "DELETE",
    token: ADMIN_TOKEN
  });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.message,
    "No se puede eliminar el equipo porque tiene jugadores o partidos asociados."
  );
});

test("calculates standings with wins, draws and losses correctly", async () => {
  Team.find = () =>
    createQuery([
      { _id: EXISTING_HOME_TEAM_ID, name: "Halcones del Sur", coachName: "Mariana Gomez" },
      { _id: EXISTING_AWAY_TEAM_ID, name: "Pumas del Oeste", coachName: "Sergio Diaz" },
      { _id: OTHER_TEAM_ID, name: "Tigres del Centro", coachName: "Lucia Fernandez" }
    ]);
  Match.find = () =>
    createQuery([
      {
        homeTeam: EXISTING_HOME_TEAM_ID,
        awayTeam: EXISTING_AWAY_TEAM_ID,
        homeScore: 70,
        awayScore: 60,
        status: "played"
      },
      {
        homeTeam: EXISTING_HOME_TEAM_ID,
        awayTeam: OTHER_TEAM_ID,
        homeScore: 55,
        awayScore: 55,
        status: "played"
      },
      {
        homeTeam: EXISTING_AWAY_TEAM_ID,
        awayTeam: OTHER_TEAM_ID,
        homeScore: 50,
        awayScore: 65,
        status: "played"
      }
    ]);

  const response = await request("/api/standings");
  const rowsByTeam = Object.fromEntries(response.body.map((row) => [row.team, row]));

  assert.equal(response.status, 200);
  assert.deepEqual(
    {
      points: rowsByTeam["Halcones del Sur"].points,
      played: rowsByTeam["Halcones del Sur"].played,
      won: rowsByTeam["Halcones del Sur"].won,
      drawn: rowsByTeam["Halcones del Sur"].drawn,
      lost: rowsByTeam["Halcones del Sur"].lost
    },
    {
      points: 4,
      played: 2,
      won: 1,
      drawn: 1,
      lost: 0
    }
  );
  assert.deepEqual(
    {
      points: rowsByTeam["Tigres del Centro"].points,
      played: rowsByTeam["Tigres del Centro"].played,
      won: rowsByTeam["Tigres del Centro"].won,
      drawn: rowsByTeam["Tigres del Centro"].drawn,
      lost: rowsByTeam["Tigres del Centro"].lost
    },
    {
      points: 4,
      played: 2,
      won: 1,
      drawn: 1,
      lost: 0
    }
  );
  assert.deepEqual(
    {
      points: rowsByTeam["Pumas del Oeste"].points,
      played: rowsByTeam["Pumas del Oeste"].played,
      won: rowsByTeam["Pumas del Oeste"].won,
      drawn: rowsByTeam["Pumas del Oeste"].drawn,
      lost: rowsByTeam["Pumas del Oeste"].lost
    },
    {
      points: 0,
      played: 2,
      won: 0,
      drawn: 0,
      lost: 2
    }
  );
});

test("uses point difference as the first tie-breaker", async () => {
  Team.find = () =>
    createQuery([
      { _id: EXISTING_HOME_TEAM_ID, name: "Halcones del Sur", coachName: "Mariana Gomez" },
      { _id: EXISTING_AWAY_TEAM_ID, name: "Pumas del Oeste", coachName: "Sergio Diaz" },
      { _id: OTHER_TEAM_ID, name: "Tigres del Centro", coachName: "Lucia Fernandez" }
    ]);
  Match.find = () =>
    createQuery([
      {
        homeTeam: EXISTING_HOME_TEAM_ID,
        awayTeam: OTHER_TEAM_ID,
        homeScore: 80,
        awayScore: 70,
        status: "played"
      },
      {
        homeTeam: EXISTING_AWAY_TEAM_ID,
        awayTeam: OTHER_TEAM_ID,
        homeScore: 71,
        awayScore: 70,
        status: "played"
      }
    ]);

  const response = await request("/api/standings");

  assert.equal(response.status, 200);
  assert.deepEqual(
    response.body.slice(0, 2).map((row) => ({
      team: row.team,
      points: row.points,
      pointDifference: row.pointDifference
    })),
    [
      {
        team: "Halcones del Sur",
        points: 3,
        pointDifference: 10
      },
      {
        team: "Pumas del Oeste",
        points: 3,
        pointDifference: 1
      }
    ]
  );
});

test("uses points for as the second tie-breaker when the difference is the same", async () => {
  Team.find = () =>
    createQuery([
      { _id: EXISTING_HOME_TEAM_ID, name: "Halcones del Sur", coachName: "Mariana Gomez" },
      { _id: EXISTING_AWAY_TEAM_ID, name: "Pumas del Oeste", coachName: "Sergio Diaz" },
      { _id: OTHER_TEAM_ID, name: "Tigres del Centro", coachName: "Lucia Fernandez" }
    ]);
  Match.find = () =>
    createQuery([
      {
        homeTeam: EXISTING_HOME_TEAM_ID,
        awayTeam: OTHER_TEAM_ID,
        homeScore: 80,
        awayScore: 70,
        status: "played"
      },
      {
        homeTeam: EXISTING_AWAY_TEAM_ID,
        awayTeam: OTHER_TEAM_ID,
        homeScore: 75,
        awayScore: 65,
        status: "played"
      }
    ]);

  const response = await request("/api/standings");

  assert.equal(response.status, 200);
  assert.deepEqual(
    response.body.slice(0, 2).map((row) => ({
      team: row.team,
      points: row.points,
      pointDifference: row.pointDifference,
      pointsFor: row.pointsFor
    })),
    [
      {
        team: "Halcones del Sur",
        points: 3,
        pointDifference: 10,
        pointsFor: 80
      },
      {
        team: "Pumas del Oeste",
        points: 3,
        pointDifference: 10,
        pointsFor: 75
      }
    ]
  );
});
