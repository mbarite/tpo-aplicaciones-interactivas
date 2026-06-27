import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAsync } from "../hooks/useAsync";
import { useLeague } from "../context/LeagueContext";
import { getTeam } from "../services/teamService";
import { personInitials } from "../utils/text";

import TeamLogo from "../components/TeamLogo";
import MatchCard from "../components/MatchCard";
import Badge from "../components/ui/Badge";
import Loading from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";

function StatGrid({ standings }) {
  const items = [
    { label: "Posicion", value: standings.position ?? "-", accent: true },
    { label: "Puntos", value: standings.points, accent: true },
    { label: "PJ", value: standings.played },
    { label: "PG", value: standings.won },
    { label: "PE", value: standings.drawn },
    { label: "PP", value: standings.lost },
    { label: "T. favor", value: standings.pointsFor },
    { label: "T. contra", value: standings.pointsAgainst },
    {
      label: "Diferencia",
      value:
        standings.pointDifference > 0
          ? `+${standings.pointDifference}`
          : standings.pointDifference
    }
  ];

  return (
    <div className="grid grid--stats">
      {items.map((item) => (
        <div key={item.label} className={`stat ${item.accent ? "stat--accent" : ""}`}>
          <div className="stat__value">{item.value}</div>
          <div className="stat__label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const { seasonId, category, categories } = useLeague();

  // Categoria seleccionada dentro de la pagina del equipo (pestañas).
  const [cat, setCat] = useState(category);
  useEffect(() => {
    if (category) setCat(category);
  }, [category]);

  const { data, loading, error } = useAsync(
    () => getTeam(teamId, seasonId, cat),
    [teamId, seasonId, cat]
  );

  if (loading) {
    return (
      <div className="container page">
        <Loading label="Cargando equipo..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <Alert type="error">{error}</Alert>
        <Link to="/equipos" className="btn btn--secondary mt-4">
          ← Volver a equipos
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <nav className="breadcrumb">
        <Link to="/equipos">Equipos</Link>
        <span>/</span>
        <span>{data.name}</span>
      </nav>

      <section className="section">
        <div className="team-hero">
          <TeamLogo team={data} size={84} />
          <div>
            <h1>{data.name}</h1>
            <p className="text-muted">
              Entrenador/a: <strong>{data.coachName}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Pestañas por categoria: cada una es su propio torneo / tabla. */}
      <div className="cat-tabs">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`cat-tab ${item.name === cat ? "is-active" : ""}`}
            onClick={() => setCat(item.name)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <section className="section">
        <h2 className="section-title">Estadisticas {cat && `· ${cat}`}</h2>
        <StatGrid standings={data.standings} />
      </section>

      <section className="section">
        <h2 className="section-title">
          Plantel {cat && `· ${cat}`} ({data.players.length})
        </h2>
        {data.players.length === 0 ? (
          <EmptyState
            icon="🧍"
            title="Sin jugadores en esta categoria"
            message="Este equipo todavia no tiene jugadores en esta categoria."
          />
        ) : (
          <div className="player-list">
            {data.players.map((player) => (
              <div key={player.id} className="player-row">
                <span className="player-row__avatar" aria-hidden="true">
                  {personInitials(player.firstName, player.lastName)}
                </span>
                <span className="player-row__name">
                  {player.fullName}
                  {player.promoted && (
                    <Badge variant="warning" style={{ marginLeft: 8 }}>
                      ↑ asciende de {player.category}
                    </Badge>
                  )}
                </span>
                <span className="player-row__pts">{player.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">
          Partidos jugados {cat && `· ${cat}`} ({data.playedMatches.length})
        </h2>
        {data.playedMatches.length === 0 ? (
          <EmptyState icon="📊" message="Todavia no disputo partidos." />
        ) : (
          <div className="grid grid--cards">
            {data.playedMatches.map((match) => (
              <MatchCard key={match.id} match={match} to={`/partidos/${match.id}`} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">
          Partidos pendientes {cat && `· ${cat}`} ({data.pendingMatches.length})
        </h2>
        {data.pendingMatches.length === 0 ? (
          <EmptyState icon="📅" message="No tiene partidos pendientes." />
        ) : (
          <div className="grid grid--cards">
            {data.pendingMatches.map((match) => (
              <MatchCard key={match.id} match={match} to={`/partidos/${match.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
