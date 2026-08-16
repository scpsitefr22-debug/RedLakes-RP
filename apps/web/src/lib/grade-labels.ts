import { accessZones } from "@/data/site12";

export interface ApiGrade {
  id: string;
  slug: string;
  name: string;
  branch: string;
  tier: string;
  departmentId: string | null;
  pay: number | null;
  quota: number | null;
  description: string | null;
  objectives: string[];
  utilities: string[];
  accessZones: string[];
  siteSections: string[];
  departmentRef?: { id: string; slug: string; name: string } | null;
}

export const BRANCH_LABELS: Record<string, string> = {
  omega: "Conseil Oméga",
  direction: "Direction",
  securite: "Sécurité",
  scientifique: "Scientifique",
  maintenance: "Maintenance",
  general: "Général",
  classes: "Personnel détenu",
};

export const BRANCH_ORDER = [
  "omega",
  "direction",
  "securite",
  "scientifique",
  "maintenance",
  "general",
  "classes",
];

export const TIER_LABELS: Record<string, string> = {
  omega: "Conseil Oméga",
  direction: "Direction",
  officier: "Officier",
  "sous-officier": "Sous-officier",
  troupe: "Troupe",
  scientifique: "Scientifique",
  medical: "Médical",
  technique: "Technique",
  admin: "Administratif",
  class: "Classe",
};

const ACCESS_ZONE_MAP = new Map<string, { label: string; description: string }>(
  accessZones.map((z) => [z.id, z]),
);

export function getAccessZoneLabel(id: string): string {
  return ACCESS_ZONE_MAP.get(id)?.label ?? id.toUpperCase();
}

export function getAccessZoneDescription(id: string): string {
  return ACCESS_ZONE_MAP.get(id)?.description ?? "";
}
