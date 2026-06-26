import { useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useMutation } from "../../hooks/useMutation";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam
} from "../../services/teamService";

import TeamForm from "../../components/admin/TeamForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminTeamsPage() {
  const { data: teams, loading, error, reload } = useAsync(getTeams, []);
  const [modal, setModal] = useState(null); // { mode, team }
  const [confirm, setConfirm] = useState(null); // team a eliminar
  const save = useMutation();
  const remove = useMutation();

  const openCreate = () => {
    save.reset();
    setModal({ mode: "create" });
  };

  const openEdit = (team) => {
    save.reset();
    setModal({ mode: "edit", team });
  };

  const handleSubmit = (payload) => {
    save.run(
      () =>
        modal.mode === "create"
          ? createTeam(payload)
          : updateTeam(modal.team.id, payload),
      async () => {
        setModal(null);
        await reload();
      }
    );
  };

  const handleDelete = () => {
    remove.run(
      () => deleteTeam(confirm.id),
      async () => {
        setConfirm(null);
        await reload();
      }
    );
  };

  return (
    <>
      <div className="toolbar">
        <h1>Equipos</h1>
        <button className="btn btn--primary" onClick={openCreate}>
          + Nuevo equipo
        </button>
      </div>

      {loading ? (
        <Loading label="Cargando equipos..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : teams.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title="Sin equipos"
          message="Crea el primer equipo para empezar a cargar jugadores y partidos."
          action={
            <button className="btn btn--primary mt-4" onClick={openCreate}>
              + Nuevo equipo
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Entrenador/a</th>
                <th>Jugadores</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="cell-strong">{team.name}</td>
                  <td>{team.coachName}</td>
                  <td>{team.playerCount}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => openEdit(team)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => setConfirm(team)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Nuevo equipo" : "Editar equipo"}
          onClose={() => setModal(null)}
        >
          <TeamForm
            initial={modal.team}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            submitting={save.submitting}
            submitError={save.error}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar equipo"
          message={`¿Seguro que deseas eliminar "${confirm.name}"? Solo es posible si no tiene jugadores ni partidos asociados.`}
          loading={remove.submitting}
          error={remove.error}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
