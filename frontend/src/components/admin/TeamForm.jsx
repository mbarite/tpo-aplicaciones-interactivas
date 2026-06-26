import { useState } from "react";

import Field from "../ui/Field";
import Alert from "../ui/Alert";
import { required, collectErrors } from "../../utils/validation";

export default function TeamForm({ initial, onSubmit, onCancel, submitting, submitError }) {
  const [name, setName] = useState(initial?.name || "");
  const [coachName, setCoachName] = useState(initial?.coachName || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = collectErrors({
      name: required(name, "El nombre del equipo"),
      coachName: required(coachName, "El nombre del entrenador")
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ name: name.trim(), coachName: coachName.trim() });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {submitError && <Alert type="error">{submitError}</Alert>}

      <Field label="Nombre del equipo" htmlFor="team-name" error={errors.name}>
        <input
          id="team-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: Halcones del Sur"
          autoFocus
        />
      </Field>

      <Field label="Entrenador/a" htmlFor="team-coach" error={errors.coachName}>
        <input
          id="team-coach"
          value={coachName}
          onChange={(event) => setCoachName(event.target.value)}
          placeholder="Ej: Mariana Gomez"
        />
      </Field>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button className="btn btn--primary" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
