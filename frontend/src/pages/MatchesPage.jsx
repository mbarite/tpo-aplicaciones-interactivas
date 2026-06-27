import { useEffect, useMemo, useState } from "react";

import { useAsync } from "../hooks/useAsync";
import { useLeague } from "../context/LeagueContext";
import { getMatches } from "../services/matchService";
import MatchCard from "../components/MatchCard";
import Loading from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import { formatLongDate } from "../utils/format";

// Agrupa los partidos por fecha (YYYY-MM-DD) y ordena las fechas ascendente.
function groupByDate(matches) {
  const map = new Map();
  matches.forEach((match) => {
    if (!map.has(match.date)) {
      map.set(match.date, []);
    }
    map.get(match.date).push(match);
  });
  return Array.from(map.entries())
    .map(([date, list]) => ({ date, matches: list }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function MatchesPage() {
  const { seasonId, category } = useLeague();
  const { data, loading, error } = useAsync(
    () => getMatches(undefined, seasonId, category),
    [seasonId, category]
  );

  const days = useMemo(() => groupByDate(data || []), [data]);
  const [index, setIndex] = useState(0);

  // Al cargar (o cambiar temporada/categoria) ubicarse en la fecha con partidos
  // mas cercana a hoy; si todas son pasadas, en la ultima.
  useEffect(() => {
    if (days.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    let target = days.findIndex((day) => day.date >= today);
    if (target === -1) target = days.length - 1;
    setIndex(target);
  }, [days]);

  const current = days[index];
  const goPrev = () => setIndex((value) => Math.max(0, value - 1));
  const goNext = () => setIndex((value) => Math.min(days.length - 1, value + 1));

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Partidos {category && `· ${category}`}</h1>
        <p>
          Resultados y próximos encuentros del torneo. Usá las flechas para
          moverte entre fechas y tocá un partido para ver el detalle.
        </p>
      </header>

      {loading ? (
        <Loading label="Cargando partidos..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : days.length === 0 || !current ? (
        <EmptyState
          icon="🏀"
          title="No hay partidos"
          message="Todavía no se cargaron partidos para esta temporada o categoría."
        />
      ) : (
        <>
          <div className="day-nav">
            <button
              type="button"
              className="day-nav__btn"
              onClick={goPrev}
              disabled={index <= 0}
              aria-label="Fecha anterior"
            >
              ◀
            </button>
            <div className="day-nav__center">
              <span className="day-nav__date">{formatLongDate(current.date)}</span>
              <span className="day-nav__meta">
                Fecha {index + 1} de {days.length} · {current.matches.length}{" "}
                {current.matches.length === 1 ? "partido" : "partidos"}
              </span>
            </div>
            <button
              type="button"
              className="day-nav__btn"
              onClick={goNext}
              disabled={index >= days.length - 1}
              aria-label="Fecha siguiente"
            >
              ▶
            </button>
          </div>

          <div className="grid grid--cards">
            {current.matches.map((match) => (
              <MatchCard key={match.id} match={match} to={`/partidos/${match.id}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
