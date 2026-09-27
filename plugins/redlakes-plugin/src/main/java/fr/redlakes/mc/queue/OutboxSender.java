package fr.redlakes.mc.queue;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.core.ConnectionState;
import fr.redlakes.mc.core.CoreClient;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;

import java.io.IOException;
import java.util.UUID;
import java.util.logging.Level;

/**
 * Vide la file d'envoi vers le CORE. Toujours hors thread principal
 * (§58-59) ; seuls les messages au joueur repassent sur le thread principal.
 * Un seul envoi à la fois (synchronized) : pas de double envoi concurrent
 * d'une même entrée entre l'envoi immédiat et le passage périodique.
 */
public final class OutboxSender {

    private final RedLakesPlugin plugin;
    private final Outbox outbox;
    private final CoreClient client;

    public OutboxSender(RedLakesPlugin plugin, Outbox outbox, CoreClient client) {
        this.plugin = plugin;
        this.outbox = outbox;
        this.client = client;
    }

    /** Passage périodique : tente tout ce qui attend, dans l'ordre d'arrivée. */
    public void flushAsync() {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, this::flush);
    }

    public void sendNowAsync(Outbox.Entry entry) {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> deliver(entry, true));
    }

    /** Bloquant — à appeler depuis une tâche asynchrone uniquement. */
    public synchronized void flush() {
        for (Outbox.Entry entry : outbox.snapshot()) {
            if (!deliver(entry, false)) {
                // CORE injoignable : inutile d'enchaîner les autres, on
                // réessaiera au prochain passage.
                return;
            }
        }
    }

    /** @return false si le CORE semble injoignable (arrêter le passage en cours). */
    private synchronized boolean deliver(Outbox.Entry entry, boolean immediate) {
        if (!stillQueued(entry.eventId)) {
            return true; // déjà traité par un autre passage
        }
        int attempts = plugin.getConnectionManager().getState() == ConnectionState.OFFLINE ? 1 : client.getMaxAttempts();
        try {
            CoreClient.Response response = client.postJson(pathFor(entry), entry.payload, attempts);
            DeliveryOutcome outcome = DeliveryOutcome.forStatus(response.status);
            switch (outcome) {
                case DELIVERED:
                    outbox.remove(entry.eventId);
                    notifyPlayer(entry, ChatColor.GREEN + "[CORE] " + ChatColor.WHITE
                            + "Rapport transmis" + (immediate ? "" : " (envoi différé)") + " : " + subjectOf(entry));
                    return true;
                case REJECTED:
                    outbox.remove(entry.eventId);
                    plugin.getLogger().warning("Rapport refusé par le CORE (" + response.status + ") pour "
                            + entry.playerName + " — retiré de la file.");
                    notifyPlayer(entry, ChatColor.RED + "[CORE] " + ChatColor.WHITE
                            + "Rapport refusé : " + rejectionReason(response));
                    return true;
                default:
                    outbox.recordFailure(entry.eventId, "HTTP " + response.status);
                    if (response.status == 401) {
                        plugin.getLogger().warning("Clé CORE refusée (401) — la file d'envoi reste en attente, vérifier core.sync-key.");
                    }
                    if (immediate) {
                        notifyQueued(entry);
                    }
                    return false;
            }
        } catch (CoreClient.CoreClientException e) {
            safeRecordFailure(entry, "injoignable");
            if (immediate) {
                notifyQueued(entry);
            }
            return false;
        } catch (IOException e) {
            plugin.getLogger().log(Level.WARNING, "Écriture de la file d'envoi impossible", e);
            return false;
        } catch (RuntimeException e) {
            plugin.getLogger().log(Level.WARNING, "Erreur inattendue pendant l'envoi " + entry.eventId, e);
            return false;
        }
    }

    private boolean stillQueued(String eventId) {
        for (Outbox.Entry e : outbox.snapshot()) {
            if (e.eventId.equals(eventId)) {
                return true;
            }
        }
        return false;
    }

    private static String pathFor(Outbox.Entry entry) {
        // Seul type d'écriture pour l'instant ; le switch accueillera les suivants (missions...).
        if ("REPORT".equals(entry.type)) {
            return "/sync/minecraft/" + entry.playerUuid + "/reports";
        }
        throw new IllegalStateException("Type d'envoi inconnu : " + entry.type);
    }

    private void safeRecordFailure(Outbox.Entry entry, String error) {
        try {
            outbox.recordFailure(entry.eventId, error);
        } catch (IOException io) {
            plugin.getLogger().log(Level.WARNING, "Écriture de la file d'envoi impossible", io);
        }
    }

    private void notifyQueued(Outbox.Entry entry) {
        notifyPlayer(entry, ChatColor.GOLD + "[CORE] " + ChatColor.WHITE
                + "CORE indisponible — rapport mis en file, il sera transmis automatiquement.");
    }

    private void notifyPlayer(Outbox.Entry entry, String message) {
        Bukkit.getScheduler().runTask(plugin, () -> {
            Player player = Bukkit.getPlayer(UUID.fromString(entry.playerUuid));
            if (player != null && player.isOnline()) {
                player.sendMessage(message);
            }
        });
    }

    private static String subjectOf(Outbox.Entry entry) {
        try {
            JsonObject json = new JsonParser().parse(entry.payload).getAsJsonObject();
            return json.has("subject") ? json.get("subject").getAsString() : "?";
        } catch (RuntimeException e) {
            return "?";
        }
    }

    /** Message lisible : « compte non lié » pour un 404, sinon le message de validation du CORE. */
    private static String rejectionReason(CoreClient.Response response) {
        if (response.status == 404) {
            return "aucun compte REDLAKES lié à ce compte Minecraft.";
        }
        try {
            JsonObject json = new JsonParser().parse(response.body).getAsJsonObject();
            if (json.has("message")) {
                return json.get("message").isJsonArray()
                        ? json.get("message").getAsJsonArray().get(0).getAsString()
                        : json.get("message").getAsString();
            }
        } catch (RuntimeException ignored) {
            // corps non JSON
        }
        return "données refusées (" + response.status + ").";
    }
}
