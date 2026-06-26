import { useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useMutation } from "../../hooks/useMutation";
import {
  getMatches,
  createMatch,
  updateMatch,
  loadResult,
  deleteMatch
} from "../../services/matchService";
import { getTeams } from "../../services/teamService";
import { getSeasons } from "../../services/seasonService";
import { getCategories } from "../../services/categoryService";

import MatchCard from "../../components/MatchCard";
import MatchForm from "../../components/admin/MatchForm";
import ResultForm from "../../components/admin/ResultForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminMatchesPage() {
  const matches = useAsync(() => getMatches(), []);
  const teams = useAsync(getTeams, []);
  const seasons = useAsync(getSeasons, []);
  const categories = useAsync(getCategories, []);
  const [formModal, setFormModal] = useState(null); // { mode, match }
  const [resultModal, setResultModal] = useState(null); // match
  const [confirm, setConfirm] = useState(null); // match a eliminar
  const save = useMutation();
  const result = useMutation();
  const remove = useMutation();

  const loading =
    matches.loading || teams.loading || seasons.loading || categories.loading;
  const error = matches.error || teams.error || seasons.error || categories.error;
  const teamList = teams.data || [];
  const seasonList = seasons.data || [];
  const categoryList = categories.data || [];
  const missingSetup =
    !loading &&
    (teamList.length < 2 || seasonList.length === 0 || categoryList.length === 0);

  const openCreate = () => {
    save.reset();
    setFormModal({ mode: "create" });
  };

  const openEdit = (match) => {
    save.reset();
    setFormModal({ mode: "edit", match });
  };

  const openResult = (match) => {
    result.reset();
    setResultModal(match);
  };

  const handleFormSubmit = (payload) => {
    save.run(
      () =>
        formModal.mode === "create"
          ? createMatch(payload)
          : updateMatch(formModal.match.id, payload),
      async () => {
        setFormModal(null);
        await matches.reload();
      }
    );
  };

  const handleResultSubmit = (payload) => {
    result.run(
      () => loadResult(resultModal.id, payload.homeScore, payload.awayScore),
      async () => {
        setResultModal(null);
        await matches.reload();
      }
    );
  };

  const handleDelete = () => {
    remove.run(
      () => deleteMatch(confirm.id),
      async () => {
        setConfirm(null);
        await matches.reload();
      }
    );
  };

  return (
    <>
      <div className="toolbar">
        <h1>Partidos</h1>
        <button
          className="btn btn--primary"
          onClick={openCreate}
          disabled={missingSetup}
        >
          + Nuevo partido
        </button>
      </div>

      {missingSetup && (
        <div className="section">
          <Alert type="info">
            Para programar un partido necesitas al menos dos equipos, una temporada y
            una categoría creadas.
          </Alert>
        </div>
      )}

      {loading ? (
        <Loading label="Cargando partidos..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : matches.data.length === 0 ? (
        <EmptyState
          icon="🏀"
          title="Sin partidos"
          message="Programa el primer partido de la temporada."
        />
      ) : (
        <div className="grid grid--cards">
          {matches.data.map((match) => (
            <div key={match.id}>
              <MatchCard match={match} />
              <div className="flex gap-2 flex-wrap" style={{ marginTop: "8px" }}>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => openResult(match)}
                >
                  {match.status === "played" ? "Editar resultado" : "Cargar resultado"}
                </button>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => openEdit(match)}
                >
                  Editar
                </button>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => setConfirm(match)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formModal && (
        <Modal
          title={formModal.mode === "create" ? "Nuevo partido" : "Editar partido"}
          onClose={() => setFormModal(null)}
        >
          <MatchForm
            initial={formModal.match}
            teams={teamList}
            seasons={seasonList}
            categories={categoryList}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormModal(null)}
            submitting={save.submitting}
            submitError={save.error}
          />
        </Modal>
      )}

      {resultModal && (
        <Modal title="Cargar resultado" onClose={() => setResultModal(null)}>
          <ResultForm
            match={resultModal}
            onSubmit={handleResultSubmit}
            onCancel={() => setResultModal(null)}
            submitting={result.submitting}
            submitError={result.error}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar partido"
          message={`¿Seguro que deseas eliminar el partido entre "${confirm.homeTeam?.name}" y "${confirm.awayTeam?.name}"?`}
          loading={remove.submitting}
          error={remove.error}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
