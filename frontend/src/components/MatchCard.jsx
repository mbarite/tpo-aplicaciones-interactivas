import { MatchStatusBadge } from "./ui/Badge";
import { formatLongDate, formatTime } from "../utils/format";

// Tarjeta de partido reutilizada en calendario, resultados, vista de equipo y admin.
// `actions` permite inyectar botones (ej. editar / cargar resultado) desde el admin.
export default function MatchCard({ match, actions }) {
  const played = match.status === "played";
  const result = match.result;
  const homeWin = played && result && result.homeScore > result.awayScore;
  const awayWin = played && result && result.awayScore > result.homeScore;

  return (
    <article className="match-card">
      <div className="match-card__top">
        <span>{formatLongDate(match.date)}</span>
        <span className="flex gap-2" style={{ alignItems: "center" }}>
          {match.category && <span className="match-card__cat">{match.category}</span>}
          <MatchStatusBadge status={match.status} />
        </span>
      </div>

      <div className="match-card__teams">
        <div className="match-team">
          <span className="match-team__role">Local</span>
          <span className="match-team__name">{match.homeTeam?.name ?? "Equipo"}</span>
        </div>

        <div className="match-card__score">
          {played && result ? (
            <>
              <span className={`score-num ${homeWin ? "score-num--win" : ""}`}>
                {result.homeScore}
              </span>
              <span>:</span>
              <span className={`score-num ${awayWin ? "score-num--win" : ""}`}>
                {result.awayScore}
              </span>
            </>
          ) : (
            <span className="match-card__vs">VS</span>
          )}
        </div>

        <div className="match-team">
          <span className="match-team__role">Visitante</span>
          <span className="match-team__name">{match.awayTeam?.name ?? "Equipo"}</span>
        </div>
      </div>

      <div className="match-card__foot">
        <span>🕒 {formatTime(match.time)}</span>
        <span>📍 {match.venue}</span>
        {actions && <span style={{ marginLeft: "auto" }}>{actions}</span>}
      </div>
    </article>
  );
}
