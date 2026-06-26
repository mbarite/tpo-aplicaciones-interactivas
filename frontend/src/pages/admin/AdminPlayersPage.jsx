import { useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useMutation } from "../../hooks/useMutation";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer
} from "../../services/playerService";
import { getTeams } from "../../services/teamService";

import PlayerForm from "../../components/admin/PlayerForm";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminPlayersPage() {
  const players = useAsync(getPlayers, []);
  const teams = useAsync(getTeams, []);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const save = useMutation();
  const remove = useMutation();

  const loading = players.loading || teams.loading;
  const error = players.error || teams.error;
  const teamList = teams.data || [];

  const openCreate = () => {
    save.reset();
    setModal({ mode: "create" });
  };

  const openEdit = (player) => {
    save.reset();
    setModal({ mode: "edit", player });
  };

  const handleSubmit = (payload) => {
    save.run(
      () =>
        modal.mode === "create"
          ? createPlayer(payload)
          : updatePlayer(modal.player.id, payload),
      async () => {
        setModal(null);
        await players.reload();
      }
    );
  };

  const handleDelete = () => {
    remove.run(
      () => deletePlayer(confirm.id),
      async () => {
        setConfirm(null);
        await players.reload();
        await teams.reload();
      }
    );
  };

  const noTeams = !loading && teamList.length === 0;

  return (
    <>
      <div className="toolbar">
        <h1>Jugadores</h1>
        <button className="btn btn--primary" onClick={openCreate} disabled={noTeams}>
          + Nuevo jugador
        </button>
      </div>

      {noTeams && (
        <div className="section">
          <Alert type="info">
            Primero crea al menos un equipo para poder asociar jugadores.
          </Alert>
        </div>
      )}

      {loading ? (
        <Loading label="Cargando jugadores..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : players.data.length === 0 ? (
        <EmptyState
          icon="🏃"
          title="Sin jugadores"
          message="Todavia no hay jugadores cargados en la liga."
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Categoria</th>
                <th>Equipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.data.map((player) => (
                <tr key={player.id}>
                  <td className="cell-strong">{player.fullName}</td>
                  <td>
                    <Badge variant="primary">{player.category}</Badge>
                  </td>
                  <td>{player.team?.name ?? "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => openEdit(player)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => setConfirm(player)}
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
          title={modal.mode === "create" ? "Nuevo jugador" : "Editar jugador"}
          onClose={() => setModal(null)}
        >
          <PlayerForm
            initial={modal.player}
            teams={teamList}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
            submitting={save.submitting}
            submitError={save.error}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar jugador"
          message={`¿Seguro que deseas eliminar a "${confirm.fullName}"?`}
          loading={remove.submitting}
          error={remove.error}
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
