export interface ScpHistoryEntry {
  slug: string;
  number: string;
  name: string;
  class: string;
  viewedAt: number;
}

const KEY = "redlakes:scp-history";
const MAX = 6;

export function recordScpView(entry: Omit<ScpHistoryEntry, "viewedAt">) {
  if (typeof window === "undefined") return;
  try {
    const existing = getScpHistory().filter((e) => e.slug !== entry.slug);
    const next = [{ ...entry, viewedAt: Date.now() }, ...existing].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage indisponible (navigation privee, quota plein) — pas grave
  }
}

export function getScpHistory(): ScpHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
