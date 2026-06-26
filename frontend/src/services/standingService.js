import api from "./api";

// GET /api/standings -> tabla ya ordenada por el backend (puntos, dif, tantos a favor)
// [{ position, teamId, team, coachName, points, played, won, drawn, lost,
//    pointsFor, pointsAgainst, pointDifference }]
export async function getStandings() {
  const { data } = await api.get("/standings");
  return data;
}
