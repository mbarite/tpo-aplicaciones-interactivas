function serializeTeam(team) {
  if (!team) {
    return null;
  }

  return {
    id: team._id?.toString?.() || team.id,
    name: team.name
  };
}

function serializeSeason(season) {
  if (!season) {
    return null;
  }
  // La temporada puede venir poblada (objeto) o como ObjectId sin poblar.
  if (typeof season === "object" && season.name) {
    return {
      id: season._id?.toString?.() || season.id,
      name: season.name,
      year: season.year
    };
  }
  return { id: season.toString?.() || String(season), name: null };
}

function serializeMatch(match) {
  return {
    id: match._id?.toString?.() || match.id,
    category: match.category,
    season: serializeSeason(match.season),
    homeTeam: serializeTeam(match.homeTeam),
    awayTeam: serializeTeam(match.awayTeam),
    date: match.date,
    time: match.time,
    venue: match.venue,
    status: match.status,
    result:
      match.homeScore === null || match.awayScore === null
        ? null
        : {
            homeScore: match.homeScore,
            awayScore: match.awayScore
          }
  };
}

module.exports = serializeMatch;
