function serializeTeam(team) {
  if (!team) {
    return null;
  }

  return {
    id: team._id?.toString?.() || team.id,
    name: team.name
  };
}

function serializeMatch(match) {
  return {
    id: match._id?.toString?.() || match.id,
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
