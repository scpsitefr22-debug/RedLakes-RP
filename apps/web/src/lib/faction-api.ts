import { API_URL } from "@/lib/api";

export interface ApiDepartment {
  id: string;
  slug: string;
  name: string;
  factionId: string;
  omegaTier: string | null;
  directorGradeName: string | null;
  color: string | null;
  utilities: string[];
  objectives: string[];
  chefId: string | null;
  deputyIds: string[];
  budget: number;
}

export interface ApiFaction {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  history: string | null;
  color: string | null;
  clearance: number;
  playable: boolean;
  objectives: string[];
  chefId: string | null;
  deputyIds: string[];
  budget: number;
  departments: ApiDepartment[];
}

/** Pattern de fetch établi (server component + revalidate ISR) — voir src/app/grades/page.tsx */
export async function getFactions(): Promise<ApiFaction[]> {
  try {
    const res = await fetch(`${API_URL}/factions`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getFaction(slug: string): Promise<ApiFaction | null> {
  try {
    const res = await fetch(`${API_URL}/factions/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
