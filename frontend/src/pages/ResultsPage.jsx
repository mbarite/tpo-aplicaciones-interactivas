import { useAsync } from "../hooks/useAsync";
import { useLeague } from "../context/LeagueContext";
import { getResults } from "../services/matchService";
import MatchCard from "../components/MatchCard";
import Loading from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";

export default function ResultsPage() {
  const { seasonId, category } = useLeague();
  const { data, loading, error } = useAsync(
    () => getResults(seasonId, category),
    [seasonId, category]
  );

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Resultados {category && `· ${category}`}</h1>
        <p>Marcadores finales de los partidos ya disputados.</p>
      </header>

      {loading ? (
        <Loading label="Cargando resultados..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : data.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Sin resultados todavia"
          message="Cuando se cargue el marcador de un partido aparecera en esta seccion."
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
