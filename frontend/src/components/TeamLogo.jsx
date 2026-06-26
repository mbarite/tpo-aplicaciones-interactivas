import { useState } from "react";
import { teamInitials } from "../utils/text";

// Escudo/foto del equipo. Si hay logoUrl muestra la imagen; si no (o si falla la
// carga) muestra un avatar con las iniciales. Reutilizable en todas las vistas.
export default function TeamLogo({ team, size = 48, round = false }) {
  const [broken, setBroken] = useState(false);
  const logoUrl = team?.logoUrl;
  const showImage = logoUrl && !broken;

  return (
    <span
      className={`team-logo ${round ? "team-logo--round" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showImage ? (
        <img src={logoUrl} alt="" onError={() => setBroken(true)} />
      ) : (
        <span className="team-logo__initials" style={{ fontSize: Math.round(size * 0.4) }}>
          {teamInitials(team?.name)}
        </span>
      )}
    </span>
  );
}
