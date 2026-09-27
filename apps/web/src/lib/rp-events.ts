export type RpEventStatus = "PLANNED" | "ACTIVE" | "CLOSED" | "CANCELLED";

export const RP_EVENT_STATUS_LABELS: Record<RpEventStatus, string> = {
  PLANNED: "Planifiée",
  ACTIVE: "En cours",
  CLOSED: "Terminée",
  CANCELLED: "Annulée",
};

// Échelle de statut du design system : jaune = en attente, vert = actif,
// gris = inactif/archivé.
export const RP_EVENT_STATUS_COLORS: Record<RpEventStatus, string> = {
  PLANNED: "text-yellow-400 border-yellow-400/30",
  ACTIVE: "text-green-400 border-green-400/30",
  CLOSED: "text-gray-500 border-metal",
  CANCELLED: "text-gray-500 border-metal",
};
