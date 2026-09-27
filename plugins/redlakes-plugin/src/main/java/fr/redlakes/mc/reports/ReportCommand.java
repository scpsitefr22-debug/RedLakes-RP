package fr.redlakes.mc.reports;

import com.google.gson.JsonObject;
import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.player.MinecraftSession;
import fr.redlakes.mc.queue.Outbox;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabExecutor;
import org.bukkit.entity.Player;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

/**
 * /rapport &lt;type&gt; &lt;sujet&gt; | &lt;description&gt; — dépose un rapport personnel
 * dans le CORE depuis le jeu (§31). Le rapport suit exactement la même
 * chaîne que sur le site (classification, staff de la faction, Discord) ;
 * sa visibilité reste décidée côté API. La position est ajoutée par le
 * serveur, jamais saisie par le joueur.
 */
public final class ReportCommand implements TabExecutor {

    private static final long COOLDOWN_MS = 60_000L;

    private final RedLakesPlugin plugin;
    private final Map<UUID, Long> lastReport = new ConcurrentHashMap<>();

    public ReportCommand(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }
        Player player = (Player) sender;

        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());
        if (session == null || !session.hasCharacter) {
            player.sendMessage(ChatColor.GRAY + "Aucun personnage CORE synchronisé : impossible de déposer un rapport.");
            return true;
        }

        ReportRequest request = ReportRequest.parse(args);
        if (!request.isValid()) {
            player.sendMessage(ChatColor.RED + request.error);
            return true;
        }

        long now = System.currentTimeMillis();
        Long last = lastReport.get(player.getUniqueId());
        if (last != null && now - last < COOLDOWN_MS) {
            long wait = (COOLDOWN_MS - (now - last)) / 1000 + 1;
            player.sendMessage(ChatColor.GRAY + "Patiente " + wait + " s avant un nouveau rapport.");
            return true;
        }

        Outbox.Entry entry = buildEntry(player, request);
        // Posé tout de suite : empêche de doubler l'envoi en répétant la commande
        // pendant que la mise en file tourne en arrière-plan.
        lastReport.put(player.getUniqueId(), now);
        // Mise en file (écriture disque) hors thread principal, puis envoi immédiat.
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
        return true;
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

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length != 1) {
            return Collections.emptyList();
        }
        List<String> matches = new ArrayList<>();
        for (String type : ReportRequest.SUGGESTED_TYPES) {
            if (type.startsWith(args[0].toLowerCase())) {
                matches.add(type);
            }
        }
        return matches;
    }
}
