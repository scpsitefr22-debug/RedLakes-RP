package fr.redlakes.mc.reports;

import com.google.gson.JsonObject;
import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.queue.Outbox;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.entity.Player;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

/**
 * Point unique de dépôt d'un rapport, que la saisie vienne de la commande
 * en une ligne ou du formulaire papier : anti-spam, eventId d'idempotence,
 * position calculée par le serveur, mise en file persistante puis envoi.
 */
public final class ReportSubmitter {

    private static final long COOLDOWN_MS = 60_000L;

    private final RedLakesPlugin plugin;
    private final Map<UUID, Long> lastReport = new ConcurrentHashMap<>();

    public ReportSubmitter(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    /** Secondes à attendre avant un nouveau rapport, 0 si possible tout de suite. */
    public long cooldownRemainingSeconds(Player player) {
        Long last = lastReport.get(player.getUniqueId());
        if (last == null) {
            return 0;
        }
        long left = COOLDOWN_MS - (System.currentTimeMillis() - last);
        return left <= 0 ? 0 : left / 1000 + 1;
    }

    /** À appeler depuis le thread principal, après validation et contrôle de l'anti-spam. */
    public void submit(Player player, ReportRequest request) {
        Outbox.Entry entry = buildEntry(player, request);
        // Posé tout de suite : empêche de doubler l'envoi en répétant la saisie
        // pendant que la mise en file tourne en arrière-plan.
        lastReport.put(player.getUniqueId(), System.currentTimeMillis());
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                if (!plugin.getOutbox().add(entry)) {
                    Bukkit.getScheduler().runTask(plugin, () -> player.sendMessage(ChatColor.RED
                            + "File d'envoi saturée (CORE indisponible depuis longtemps) — réessaie plus tard."));
                    return;
                }
            } catch (IOException e) {
                lastReport.remove(player.getUniqueId());
                plugin.getLogger().log(Level.WARNING, "Mise en file du rapport impossible", e);
                Bukkit.getScheduler().runTask(plugin, () -> player.sendMessage(ChatColor.RED
                        + "Erreur technique : rapport non enregistré."));
                return;
            }
            plugin.getOutboxSender().sendNowAsync(entry);
        });
        player.sendMessage(ChatColor.GRAY + "Transmission du rapport au CORE...");
    }

    private Outbox.Entry buildEntry(Player player, ReportRequest request) {
        String eventId = UUID.randomUUID().toString();

        JsonObject body = new JsonObject();
        body.addProperty("eventId", eventId);
        body.addProperty("type", request.type);
        body.addProperty("subject", request.subject);
        body.addProperty("content", request.content);
        body.addProperty("location", describe(player.getLocation()));

        Outbox.Entry entry = new Outbox.Entry();
        entry.eventId = eventId;
        entry.type = "REPORT";
        entry.playerUuid = player.getUniqueId().toString();
        entry.playerName = player.getName();
        entry.payload = body.toString();
        entry.createdAt = System.currentTimeMillis();
        return entry;
    }

    private static String describe(Location location) {
        String world = location.getWorld() != null ? location.getWorld().getName() : "?";
        return world + " (" + location.getBlockX() + ", " + location.getBlockY() + ", " + location.getBlockZ() + ")";
    }
}
