import { Link } from "react-router-dom";

import { useAsync } from "../hooks/useAsync";
import { getTeams } from "../services/teamService";
import { teamInitials } from "../utils/text";

import Loading from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";

export default function TeamsPage() {
  const { data, loading, error } = useAsync(getTeams, []);

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Equipos de la liga</h1>
        <p>Conoce a los clubes participantes. Toca un equipo para ver su plantel completo.</p>
      </header>

      {loading ? (
        <Loading label="Cargando equipos..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : data.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Todavia no hay equipos"
          message="Cuando se den de alta equipos apareceran en esta seccion."
        />
      ) : (
        <div className="grid grid--cards">
          {data.map((team) => (
            <Link
              key={team.id}
              to={`/equipos/${team.id}`}
              className="card card--interactive team-card"
            >
              <div className="team-card__avatar" aria-hidden="true">
                {teamInitials(team.name)}
              </div>
              <div>
                <h3>{team.name}</h3>
                <div className="team-card__coach">DT: {team.coachName}</div>
              </div>
              <div className="team-card__meta">
                <span>
                  👥 {team.playerCount} jugador{team.playerCount === 1 ? "" : "es"}
                </span>
                <span className="quick-card__link" style={{ marginLeft: "auto" }}>
                  Ver detalle →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
