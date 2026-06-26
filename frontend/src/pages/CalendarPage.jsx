import { useAsync } from "../hooks/useAsync";
import { useLeague } from "../context/LeagueContext";
import { getCalendar } from "../services/matchService";
import MatchCard from "../components/MatchCard";
import Loading from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";

export default function CalendarPage() {
  const { seasonId, category } = useLeague();
  const { data, loading, error } = useAsync(
    () => getCalendar(seasonId, category),
    [seasonId, category]
  );

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Calendario {category && `· ${category}`}</h1>
        <p>Proximos encuentros programados del torneo, con fecha, horario y sede.</p>
      </header>

      {loading ? (
        <Loading label="Cargando calendario..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : data.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No hay partidos programados"
          message="Todavia no se agendaron partidos pendientes."
        />
      ) : (
        <div className="grid grid--cards">
          {data.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
