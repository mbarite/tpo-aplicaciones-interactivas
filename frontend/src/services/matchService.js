import api from "./api";

// GET /api/matches            -> todos los partidos (serializados)
// GET /api/matches?status=... -> filtrados por estado (scheduled | played)
export async function getMatches(status) {
  const { data } = await api.get("/matches", {
    params: status ? { status } : undefined
  });
  return data;
}

// GET /api/matches/calendar -> partidos programados (pendientes)
export async function getCalendar() {
  const { data } = await api.get("/matches/calendar");
  return data;
}

// GET /api/matches/results -> partidos jugados (con resultado)
export async function getResults() {
  const { data } = await api.get("/matches/results");
  return data;
}

// POST /api/matches  (admin) body: { homeTeamId, awayTeamId, date, time, venue }
export async function createMatch(payload) {
  const { data } = await api.post("/matches", payload);
  return data;
}

// PUT /api/matches/:id  (admin) body parcial: { homeTeamId?, awayTeamId?, date?, time?, venue? }
export async function updateMatch(matchId, payload) {
  const { data } = await api.put(`/matches/${matchId}`, payload);
  return data;
}

// PATCH /api/matches/:id/result  (admin) body: { homeScore, awayScore }
export async function loadResult(matchId, homeScore, awayScore) {
  const { data } = await api.patch(`/matches/${matchId}/result`, {
    homeScore,
    awayScore
  });
  return data;
}

// DELETE /api/matches/:id  (admin)
export async function deleteMatch(matchId) {
  const { data } = await api.delete(`/matches/${matchId}`);
  return data;
}
