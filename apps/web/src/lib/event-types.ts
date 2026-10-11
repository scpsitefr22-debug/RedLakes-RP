/** Types d'événements de jeu : libellé et couleur (liste, fiche). */
export const EVENT_TYPE_LABELS: Record<string, string> = {
  breach: "Brèche",
  invasion: "Invasion",
  guerre: "Guerre",
  "crise-xk": "Crise XK",
  experience: "Expérience ratée",
};

export const EVENT_TYPE_HEX: Record<string, string> = {
  breach: "#ef4444",
  invasion: "#fb923c",
  guerre: "#facc15",
  "crise-xk": "#c084fc",
  experience: "#22d3ee",
};

export function eventTypeLabel(type: string) {
  return EVENT_TYPE_LABELS[type] ?? type;
}

export function eventTypeHex(type: string) {
  return EVENT_TYPE_HEX[type] ?? "#9ca3af";
}
