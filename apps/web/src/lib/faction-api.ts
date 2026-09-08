import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import type { ApiFaction, ApiFactionRelation, FactionMember } from "@/lib/faction-types";

export type {
  ApiDepartment,
  ApiFaction,
  ApiFactionRelation,
  FactionEvent,
  FactionMember,
} from "@/lib/faction-types";
export {
  FACTION_RELATION_COLORS,
  FACTION_RELATION_LABELS,
} from "@/lib/faction-types";
export type { FactionRelationStatus } from "@/lib/faction-types";

/**
 * Ces endpoints distinguent visiteur anonyme / connecte (departements
 * internes, membres, relations reservees aux comptes connectes depuis
 * l'audit RP/HRP) — sans transmettre le cookie de session ici, un fetch
 * server-side traiterait TOUT visiteur comme anonyme, meme connecte.
 */
async function authHeaders(): Promise<HeadersInit | undefined> {
  const token = (await cookies()).get("redlakes_token")?.value;
  return token ? { Cookie: `redlakes_token=${token}` } : undefined;
}

export async function getFactionMembers(slug: string): Promise<FactionMember[]> {
  try {
    const res = await fetch(`${API_URL}/factions/${slug}/members`, {
      cache: "no-store",
      headers: await authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Pattern de fetch établi (server component + revalidate ISR) — voir src/app/grades/page.tsx */
export async function getFactions(): Promise<ApiFaction[]> {
  try {
    const res = await fetch(`${API_URL}/factions`, {
      cache: "no-store",
      headers: await authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getFaction(slug: string): Promise<ApiFaction | null> {
  try {
    const res = await fetch(`${API_URL}/factions/${slug}`, {
      cache: "no-store",
      headers: await authHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getFactionRelations(
  factionId: string,
): Promise<ApiFactionRelation[]> {
  try {
    const res = await fetch(`${API_URL}/faction-relations/faction/${factionId}`, {
      cache: "no-store",
      headers: await authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
