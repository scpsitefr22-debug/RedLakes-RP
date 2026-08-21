import sharp from "sharp";

export interface RpCardData {
  minecraftUsername: string | null;
  rpName: string | null;
  grade: string;
  factionName: string;
  factionColor: string | null;
  departmentName: string | null;
  teamName: string | null;
}

const CARD_WIDTH = 440;
const CARD_HEIGHT = 250;
const FALLBACK_ACCENT = "#8b0a0a";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** Normalise une couleur CORE (#RGB / #RRGGBB) en #RRGGBB, avec repli REDLAKES */
function normalizeAccent(hex: string | null): string {
  if (!hex) return FALLBACK_ACCENT;
  const cleaned = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) return cleaned;
  if (/^#[0-9a-fA-F]{3}$/.test(cleaned)) {
    const [, r, g, b] = cleaned;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return FALLBACK_ACCENT;
}

/** Assombrit une couleur hex vers le fond de carte (mix avec du noir) */
function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 0xff) * (1 - amount));
  const g = Math.round(((n >> 8) & 0xff) * (1 - amount));
  const b = Math.round((n & 0xff) * (1 - amount));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

async function fetchAvatarDataUri(username: string): Promise<string | null> {
  try {
    const res = await fetch(`https://mc-heads.net/avatar/${encodeURIComponent(username)}/96`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function buildAvatarMarkup(avatarDataUri: string | null, accent: string): string {
  if (avatarDataUri) {
    return `<image href="${avatarDataUri}" x="16" y="46" width="88" height="88" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 2)" />`;
  }
  return (
    `<circle cx="60" cy="76" r="16" fill="#3a3b3e"/>` +
    `<path d="M36 128 Q60 100 84 128 Z" fill="#3a3b3e"/>`
  );
}

function buildRpCardSvg(data: RpCardData, avatarDataUri: string | null): string {
  const accent = normalizeAccent(data.factionColor);
  const stripBg = darken(accent, 0.82);
  const name = escapeXml(truncate(data.rpName || data.minecraftUsername || "Agent non identifié", 26));
  const grade = escapeXml(truncate(data.grade, 30));
  const factionDept = escapeXml(
    truncate([data.factionName, data.departmentName].filter(Boolean).join(" · "), 34),
  );
  const team = data.teamName ? escapeXml(truncate(data.teamName, 30)) : null;

  return `<svg viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img">
    <title>Carte d'identité RP — ${name}</title>
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#101113"/>
    <rect x="0" y="0" width="${CARD_WIDTH}" height="38" fill="${stripBg}"/>
    <rect x="0" y="36" width="${CARD_WIDTH}" height="2" fill="${accent}"/>
    <text x="18" y="17" font-family="'Courier New', Consolas, monospace" font-size="10" letter-spacing="2" fill="${accent}" font-weight="700">REDLAKES RP — SITE-12</text>
    <text x="18" y="30" font-family="'Courier New', Consolas, monospace" font-size="8" letter-spacing="1.5" fill="#8a8f98">CARTE D'HABILITATION PERSONNEL</text>

    <rect x="16" y="52" width="96" height="96" rx="2" fill="#050506" stroke="#3a3b3e"/>
    ${buildAvatarMarkup(avatarDataUri, accent)}
    <rect x="16" y="52" width="96" height="96" rx="2" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.8"/>

    <text x="128" y="66" font-family="'Courier New', Consolas, monospace" font-size="9" fill="#8a8f98" letter-spacing="1">IDENTITÉ RP</text>
    <text x="128" y="82" font-family="Georgia, 'Times New Roman', serif" font-size="17" fill="#f2f2f2" font-weight="700">${name}</text>

    <text x="128" y="102" font-family="'Courier New', Consolas, monospace" font-size="9" fill="#8a8f98" letter-spacing="1">GRADE</text>
    <text x="128" y="118" font-family="Georgia, 'Times New Roman', serif" font-size="14" fill="${accent}">${grade}</text>

    <text x="128" y="138" font-family="'Courier New', Consolas, monospace" font-size="9" fill="#8a8f98" letter-spacing="1">FACTION · DÉPARTEMENT</text>
    <text x="128" y="154" font-family="Georgia, 'Times New Roman', serif" font-size="13" fill="#dbdee1">${factionDept}</text>

    ${
      team
        ? `<text x="128" y="174" font-family="'Courier New', Consolas, monospace" font-size="9" fill="#8a8f98" letter-spacing="1">ÉQUIPE</text>
    <text x="128" y="188" font-family="Georgia, 'Times New Roman', serif" font-size="12.5" fill="#dbdee1">${team}</text>`
        : ""
    }

    <text x="16" y="212" font-family="'Courier New', Consolas, monospace" font-size="8" fill="#5c6067">CLASSIFIÉ — ACCÈS RESTREINT</text>

    <rect x="0" y="${CARD_HEIGHT - 26}" width="${CARD_WIDTH}" height="26" fill="${stripBg}"/>
    <text x="18" y="${CARD_HEIGHT - 9}" font-family="'Courier New', Consolas, monospace" font-size="9" fill="${accent}" letter-spacing="1">REDLAKES RP</text>
    <text x="${CARD_WIDTH - 18}" y="${CARD_HEIGHT - 9}" font-family="'Courier New', Consolas, monospace" font-size="9" fill="#8a8f98" text-anchor="end">/hub → Mon profil</text>
  </svg>`;
}

/** Genere le PNG de la carte d'identite RP — best effort, jamais bloquant pour /hub */
export async function generateRpCardPng(data: RpCardData): Promise<Buffer | null> {
  try {
    const avatarDataUri = data.minecraftUsername
      ? await fetchAvatarDataUri(data.minecraftUsername)
      : null;
    const svg = buildRpCardSvg(data, avatarDataUri);
    return await sharp(Buffer.from(svg)).png().toBuffer();
  } catch (err) {
    console.warn("[rp-card] Generation echouee :", err);
    return null;
  }
}
