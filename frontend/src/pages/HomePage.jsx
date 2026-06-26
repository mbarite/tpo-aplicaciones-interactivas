import { Link } from "react-router-dom";

import { LEAGUE } from "../config";
import { useAsync } from "../hooks/useAsync";
import { useLeague } from "../context/LeagueContext";
import { getStandings } from "../services/standingService";
import { getCalendar } from "../services/matchService";

import StandingsTable from "../components/StandingsTable";
import MatchCard from "../components/MatchCard";
import Loading from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";

const QUICK_LINKS = [
  {
    icon: "🏆",
    title: "Clasificacion",
    text: "Tabla de posiciones actualizada automaticamente con cada resultado.",
    to: "/clasificacion",
    label: "Ver tabla"
  },
  {
    icon: "📅",
    title: "Calendario",
    text: "Todos los partidos programados con fecha, horario y sede.",
    to: "/calendario",
    label: "Ver calendario"
  },
  {
    icon: "📊",
    title: "Resultados",
    text: "Marcadores finales de las fechas ya disputadas.",
    to: "/resultados",
    label: "Ver resultados"
  },
  {
    icon: "👥",
    title: "Equipos",
    text: "Plantel, entrenador y estadisticas de cada club de la liga.",
    to: "/equipos",
    label: "Ver equipos"
  }
];

export default function HomePage() {
  const { seasonId, category } = useLeague();
  const standings = useAsync(
    () => getStandings(seasonId, category),
    [seasonId, category]
  );
  const calendar = useAsync(
    () => getCalendar(seasonId, category),
    [seasonId, category]
  );

  const topStandings = (standings.data || []).slice(0, 5);
  const nextMatches = (calendar.data || []).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <span className="hero__badge">🏀 {LEAGUE.season}</span>
          <h1>{LEAGUE.name}</h1>
          <p className="hero__lead">{LEAGUE.description}</p>
          <div className="hero__actions">
            <Link to="/clasificacion" className="btn btn--primary">
              Ver clasificacion
            </Link>
            <Link to="/calendario" className="btn btn--outline-light">
              Calendario de partidos
            </Link>
            <Link to="/equipos" className="btn btn--outline-light">
              Equipos
            </Link>
          </div>
        </div>
      </section>

      <div className="container page">
        <section className="section">
          <div className="grid grid--quick">
            {QUICK_LINKS.map((item) => (
              <Link key={item.to} to={item.to} className="quick-card">
                <span className="quick-card__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="quick-card__link">{item.label} →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="toolbar">
            <h2 className="section-title">Clasificacion general</h2>
            <Link to="/clasificacion" className="btn btn--secondary btn--sm">
              Tabla completa
            </Link>
          </div>
          {standings.loading ? (
            <Loading label="Cargando clasificacion..." />
          ) : standings.error ? (
            <Alert type="error">{standings.error}</Alert>
          ) : (
            <StandingsTable rows={topStandings} compact />
          )}
        </section>

        <section className="section">
          <div className="toolbar">
            <h2 className="section-title">Proximos partidos</h2>
            <Link to="/calendario" className="btn btn--secondary btn--sm">
              Ver calendario
            </Link>
          </div>
          {calendar.loading ? (
            <Loading label="Cargando calendario..." />
          ) : calendar.error ? (
            <Alert type="error">{calendar.error}</Alert>
          ) : nextMatches.length > 0 ? (
            <div className="grid grid--cards">
              {nextMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📅"
              title="No hay partidos programados"
              message="Cuando se agenden nuevos partidos apareceran aca."
            />
          )}
        </section>
      </div>
    </>
  );
}
