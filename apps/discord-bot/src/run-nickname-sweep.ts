/**
 * Applique le pseudo RP force (voir lib/format-rp-nickname.ts) a tous les
 * membres deja lies au site — utile pour rattraper les comptes lies avant
 * ce changement, sans attendre leur prochaine synchro naturelle (login,
 * resync, changement de grade, modification d'identite RP).
 *
 * Usage :
 *   npm run nicknames:sweep            (dry-run — affiche les changements)
 *   npm run nicknames:sweep -- --apply (applique reellement)
 */
import "dotenv/config";
import { REST, Routes } from "discord.js";
import { formatRpNickname, isRpIdentityMissing } from "./lib/format-rp-nickname.js";

const token = process.env.DISCORD_BOT_TOKEN as string;
const guildId = process.env.DISCORD_GUILD_ID as string;
const apiBase = process.env.API_BASE_URL ?? "http://localhost:3001/api";
const syncKey = process.env.SYNC_API_KEY ?? "";
const APPLY = process.argv.includes("--apply");

const rest = new REST({ version: "10" }).setToken(token);

interface DiscordMember {
  user: { id: string; username: string; bot?: boolean; global_name?: string | null };
  nick?: string | null;
  roles: string[];
}

/** Le rôle "Assistant IA" est exempte du pseudo RP force (voir lib/roles.ts) */
const NICKNAME_EXEMPT_ROLE_NAME = "Assistant IA";

async function findExemptRoleIds(): Promise<Set<string>> {
  const roles = (await rest.get(Routes.guildRoles(guildId))) as { id: string; name: string }[];
  return new Set(
    roles.filter((r) => r.name.includes(NICKNAME_EXEMPT_ROLE_NAME)).map((r) => r.id),
  );
}

interface ProfileOrNotLinked {
  notLinked?: true;
  rpFirstName?: string | null;
  rpLastName?: string | null;
  minecraftUsername?: string | null;
  grade?: string | null;
}

async function fetchAllMembers(): Promise<DiscordMember[]> {
  const members: DiscordMember[] = [];
  let after = "0";
  for (;;) {
    const batch = (await rest.get(Routes.guildMembers(guildId), {
      query: new URLSearchParams({ limit: "1000", after }),
    })) as DiscordMember[];
    if (!batch.length) break;
    members.push(...batch);
    after = batch[batch.length - 1].user.id;
    if (batch.length < 1000) break;
  }
  return members;
}

async function getProfile(discordId: string): Promise<ProfileOrNotLinked> {
  const res = await fetch(`${apiBase}/sync/discord/${encodeURIComponent(discordId)}`, {
    headers: { "X-Redlakes-Sync-Key": syncKey },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 404) return { notLinked: true };
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as ProfileOrNotLinked;
}

async function main(): Promise<void> {
  const [members, exemptRoleIds] = await Promise.all([fetchAllMembers(), findExemptRoleIds()]);
  console.log(`${members.length} membre(s) sur le serveur — vérification du lien...\n`);
  if (exemptRoleIds.size) {
    console.log(`Rôle(s) exempté(s) détecté(s) : ${exemptRoleIds.size} ("${NICKNAME_EXEMPT_ROLE_NAME}")\n`);
  }

  let checked = 0;
  let linked = 0;
  let missingRp = 0;
  let exempted = 0;
  const changes: { id: string; username: string; from: string; to: string }[] = [];

  for (const m of members) {
    if (m.user.bot) continue;
    if (m.roles.some((id) => exemptRoleIds.has(id))) {
      exempted += 1;
      continue;
    }
    checked += 1;

    let profile: ProfileOrNotLinked;
    try {
      profile = await getProfile(m.user.id);
    } catch (err) {
      console.error(`API injoignable (${(err as Error).message}) — arrêt.`);
      break;
    }
    if (profile.notLinked) continue;

    linked += 1;
    if (isRpIdentityMissing(profile)) missingRp += 1;

    const targetNick = formatRpNickname(profile);
    const currentNick = m.nick ?? m.user.global_name ?? m.user.username;
    if (currentNick !== targetNick) {
      changes.push({ id: m.user.id, username: m.user.username, from: currentNick, to: targetNick });
    }
  }

  console.log(`Vérifiés : ${checked} (bots et rôle "${NICKNAME_EXEMPT_ROLE_NAME}" exclus : ${exempted})`);
  console.log(`Liés au site : ${linked}`);
  console.log(`Dont RP non renseigné : ${missingRp}`);
  console.log(`Pseudos à changer : ${changes.length}\n`);

  for (const c of changes.slice(0, 30)) {
    console.log(`  @${c.username.padEnd(20)} "${c.from}" -> "${c.to}"`);
  }
  if (changes.length > 30) console.log(`  ... et ${changes.length - 30} autre(s)`);

  if (!APPLY) {
    console.log("\n(dry-run — relance avec --apply pour appliquer réellement)");
    return;
  }

  console.log("\nApplication...");
  let ok = 0;
  let failed = 0;
  for (const c of changes) {
    try {
      await rest.patch(Routes.guildMember(guildId, c.id), { body: { nick: c.to } });
      ok += 1;
    } catch (err) {
      failed += 1;
      console.warn(`  échec pour @${c.username} :`, (err as Error).message ?? err);
    }
  }
  console.log(`\nOK : ${ok}, échecs : ${failed}`);
}

main().catch((err) => {
  console.error("Échec :", err);
  process.exit(1);
});
