package fr.redlakes.mc.player;

import fr.redlakes.mc.RedLakesPlugin;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

public final class PlayerConnectionListener implements Listener {

    private final RedLakesPlugin plugin;

    public PlayerConnectionListener(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        // Léger délai pour laisser la connexion se stabiliser avant le premier appel réseau.
        Bukkit.getScheduler().runTaskLaterAsynchronously(plugin, () -> syncPlayer(player), 40L);
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        plugin.getSessionCache().remove(player.getUniqueId());
        plugin.getPresentationManager().removePlayer(player);
    }

    /**
     * Appelé à la connexion et par le rafraîchissement périodique. Compare
     * l'ancienne et la nouvelle session (§12-13 : GradeChanged/FactionChanged)
     * — ne notifie le joueur que lors de la première sync ou d'un vrai
     * changement, jamais à chaque poll silencieux.
     */
    public void syncPlayer(Player player) {
        MinecraftSession previous = plugin.getSessionCache().getStale(player.getUniqueId());
        MinecraftSession session = plugin.getSessionSyncService().fetch(player.getUniqueId(), player.getName());

        if (session == null) {
            plugin.getLogger().info(player.getName() + " — pas encore de compte CORE lié à cet UUID.");
            return;
        }
        if (!session.hasCharacter) {
            plugin.getLogger().info(player.getName() + " — compte CORE lié, aucun personnage actif.");
            return;
        }

        SessionChange change = SessionChange.compare(previous, session);
        if (change.gradeChanged) {
            plugin.getLogger().info(player.getName() + " — GradeChanged: "
                    + (previous.grade != null ? previous.grade.name : "?") + " -> " + session.grade.name);
        }
        if (change.factionChanged) {
            plugin.getLogger().info(player.getName() + " — FactionChanged: "
                    + (previous.faction != null ? previous.faction.name : "?") + " -> " + session.faction.name);
        }

        if (!change.isRelevant()) {
            return;
        }

        // Team/nametag = API Bukkit, doit s'exécuter sur le thread principal.
        Bukkit.getScheduler().runTask(plugin, () -> {
            if (!player.isOnline()) {
                return;
            }
            plugin.getPresentationManager().applyToPlayer(player, session);
            plugin.getTabListManager().applyToPlayer(player, session);
            notifyPlayer(player, session, change);
        });
    }

    private void notifyPlayer(Player player, MinecraftSession session, SessionChange change) {
        if (change.firstSync) {
            player.sendMessage(ChatColor.GOLD + "[REDLAKES] " + ChatColor.WHITE
                    + session.grade.name + ChatColor.GRAY + " — " + ChatColor.WHITE + session.faction.name);
            return;
        }
        if (change.gradeChanged) {
            player.sendMessage(ChatColor.GOLD + "[REDLAKES] " + ChatColor.WHITE
                    + "Votre grade a été mis à jour : " + ChatColor.YELLOW + session.grade.name);
        }
        if (change.factionChanged) {
            player.sendMessage(ChatColor.GOLD + "[REDLAKES] " + ChatColor.WHITE
                    + "Votre faction a été mise à jour : " + ChatColor.YELLOW + session.faction.name);
        }
    }
}
