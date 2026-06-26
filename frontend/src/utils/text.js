// Iniciales de un nombre (max. 2) para avatares: "Halcones del Sur" -> "HS".
export function teamInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .filter((word) => !["del", "de", "la", "los", "las", "el"].includes(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// Iniciales de una persona: "Tomas Rossi" -> "TR".
export function personInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
}
