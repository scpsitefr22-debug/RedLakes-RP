/** Couleurs et identite visuelle REDLAKES */
export const COLORS = {
  redlake: 0x8b0a0a,
  redlakeGlow: 0xff2d2d,
  discord: 0x5865f2,
  success: 0x2ecc71,
  warning: 0xf1c40f,
  danger: 0xe74c3c,
  aegis: 0xc0c0c0,
  info: 0x3498db,
  staff: 0x9b59b6,
} as const;

export const BRAND = {
  name: "REDLAKES RP",
  site12: "Site-12",
  footer: "REDLAKES RP — Site-12 // Classifie",
  logo: "https://mc-heads.net/avatar/MHF_Question/64",
};

export function mcAvatar(username: string): string {
  return `https://mc-heads.net/avatar/${encodeURIComponent(username)}/128`;
}

export function mcBody(username: string): string {
  return `https://mc-heads.net/body/${encodeURIComponent(username)}/right`;
}

/** Convertit une couleur hexadecimale CORE (#RRGGBB) en couleur d'embed, avec repli */
export function parseHexColor(hex: string | null | undefined): number {
  if (!hex) return COLORS.redlake;
  const n = parseInt(hex.replace("#", ""), 16);
  return Number.isNaN(n) ? COLORS.redlake : n;
}
