// variant: "scheduled" | "played" | "neutral" | "primary"
export default function Badge({ variant = "neutral", children }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

// Helper de estado de partido reutilizable en varias vistas.
export function MatchStatusBadge({ status }) {
  return status === "played" ? (
    <Badge variant="played">● Finalizado</Badge>
  ) : (
    <Badge variant="scheduled">● Programado</Badge>
  );
}
