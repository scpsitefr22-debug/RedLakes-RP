import type { GlobalNarrativeSave } from "../types/gns.js";
import { getPlayerDisplayName } from "../gns/create.js";

const ROLE_LABELS: Record<string, string> = {
  recrue: "Recrue",
};

export function interpolateNarrativeText(text: string, gns: GlobalNarrativeSave): string {
  const name = getPlayerDisplayName(gns);
  const role = ROLE_LABELS[gns.player.role] ?? gns.player.role;

  return text
    .replace(/\{player_name\}/g, name)
    .replace(/\{player_role\}/g, role)
    .replace(/\{employee_id\}/g, gns.player.employeeId ?? "RL-████████");
}

export function interpolateMessage<T extends { text: string }>(message: T, gns: GlobalNarrativeSave): T {
  return { ...message, text: interpolateNarrativeText(message.text, gns) };
}
