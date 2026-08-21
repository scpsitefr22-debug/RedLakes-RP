import { EmbedBuilder, type Client } from "discord.js";
import { api } from "./api.js";
import { config } from "../config.js";
import { COLORS, BRAND } from "./theme.js";
import { getRoleRegistry } from "./discord-role-registry.js";
import { fetchMinecraftStatus } from "./minecraft-status.js";

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatAgo(ms: number): string {
  const min = Math.round(ms / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  return `il y a ${Math.round(min / 60)} h`;
}

/** État REDLAKES CORE — reutilise par /core-status et le hub staff */
export async function buildCoreStatusEmbed(client: Client): Promise<EmbedBuilder> {
  const discordOk = client.ws.ping >= 0;
  const apiOk = await api.isOnline();
  const registry = getRoleRegistry();
  const syncLine =
    registry.refreshedAt === 0
      ? "⚪ Jamais scanné — lance `/roles-scan`"
      : `🟢 ${registry.gradeToRoleId.size} grade(s) mappé(s) (scan ${formatAgo(Date.now() - registry.refreshedAt)})`;

  const mc = config.serverOpen ? await fetchMinecraftStatus(config.minecraftIp) : null;
  const mcLine = !config.serverOpen
    ? "⚪ Fermé (pré-ouverture)"
    : mc?.online
      ? `🟢 En ligne (${mc.players?.online ?? 0}/${mc.players?.max ?? 0})`
      : "🔴 Hors ligne";

  return new EmbedBuilder()
    .setColor(discordOk && apiOk ? COLORS.success : COLORS.warning)
    .setTitle("État REDLAKES CORE")
    .addFields(
      {
        name: "Discord",
        value: discordOk ? `🟢 ${Math.round(client.ws.ping)} ms` : "🔴",
        inline: true,
      },
      { name: "API", value: apiOk ? "🟢 En ligne" : "🔴 Hors ligne", inline: true },
      { name: "Base de données", value: "⚪ Non interrogée — via API uniquement", inline: true },
      { name: "Synchronisation rôles", value: syncLine },
      { name: "Minecraft", value: mcLine, inline: true },
      { name: "Uptime bot", value: formatUptime(process.uptime()), inline: true },
    )
    .setFooter({ text: BRAND.footer })
    .setTimestamp();
}
