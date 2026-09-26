package fr.redlakes.mc.commands;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.core.ConnectionState;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

/**
 * Dispatcher racine /rl. Ne contient que le strict Phase 1 : lecture du
 * profil déjà en cache (aucune écriture RP ici) et diagnostic staff.
 */
public final class RlCommand implements CommandExecutor {

    private final RedLakesPlugin plugin;

    public RlCommand(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length >= 1 && args[0].equalsIgnoreCase("profil")) {
            return handleProfil(sender);
        }
        if (args.length >= 1 && args[0].equalsIgnoreCase("missions")) {
            return handleMissions(sender);
        }
        if (args.length >= 1 && args[0].equalsIgnoreCase("staff")) {
            return handleStaff(sender, args);
        }
        sender.sendMessage(ChatColor.GRAY + "Usage: /rl <profil|missions|staff>");
        return true;
    }

    private boolean handleStaff(CommandSender sender, String[] args) {
        if (!sender.hasPermission("redlakes.staff")) {
            sender.sendMessage(ChatColor.RED + "Permission refusée.");
            return true;
        }
        if (args.length >= 2 && args[1].equalsIgnoreCase("status")) {
            return handleStaffStatus(sender);
        }
        sender.sendMessage(ChatColor.GRAY + "Usage: /rl staff <status>");
        return true;
    }

    private boolean handleProfil(CommandSender sender) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }
        Player player = (Player) sender;
        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());
        if (session == null || !session.hasCharacter) {
            sender.sendMessage(ChatColor.GRAY + "Aucun profil CORE synchronisé pour le moment.");
            return true;
        }

        sender.sendMessage(ChatColor.GOLD + "=== Profil REDLAKES ===");
        sender.sendMessage(ChatColor.GRAY + "Grade: " + ChatColor.WHITE + session.grade.name
                + ChatColor.GRAY + " (clearance " + session.grade.clearanceLevel + ")");
        sender.sendMessage(ChatColor.GRAY + "Faction: " + ChatColor.WHITE + session.faction.name);
        if (session.department != null) {
            sender.sendMessage(ChatColor.GRAY + "Département: " + ChatColor.WHITE + session.department.name);
        }
        if (session.team != null) {
            sender.sendMessage(ChatColor.GRAY + "Équipe: " + ChatColor.WHITE + session.team.name);
        }
        return true;
    }

    private boolean handleMissions(CommandSender sender) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }
        Player player = (Player) sender;
        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());
        if (session == null || !session.hasCharacter) {
            sender.sendMessage(ChatColor.GRAY + "Aucun profil CORE synchronisé pour le moment.");
            return true;
        }
        if (session.missions == null || session.missions.isEmpty()) {
            sender.sendMessage(ChatColor.GRAY + "Aucune mission en cours.");
            return true;
        }

        sender.sendMessage(ChatColor.GOLD + "=== Missions en cours ===");
        for (MinecraftSession.Mission mission : session.missions) {
            String suffix = mission.isTeamMission ? ChatColor.DARK_GRAY + " (équipe)" : "";
            sender.sendMessage(ChatColor.YELLOW + "- " + mission.title + suffix);
            if (mission.description != null && !mission.description.isEmpty()) {
                sender.sendMessage(ChatColor.GRAY + "  " + mission.description);
            }
        }
        return true;
    }

    private boolean handleStaffStatus(CommandSender sender) {
        ConnectionState state = plugin.getConnectionManager().getState();
        ChatColor color = state == ConnectionState.ONLINE ? ChatColor.GREEN
                : state == ConnectionState.DEGRADED ? ChatColor.YELLOW : ChatColor.RED;

        long lastSuccessAt = plugin.getConnectionManager().getLastSuccessAt();
        String lastSync = lastSuccessAt < 0 ? "jamais"
                : ((System.currentTimeMillis() - lastSuccessAt) / 1000) + "s";

        sender.sendMessage(ChatColor.GOLD + "=== REDLAKES CORE (" + plugin.getCoreConfig().getServerId() + ") ===");
        sender.sendMessage(ChatColor.GRAY + "État: " + color + state);
        sender.sendMessage(ChatColor.GRAY + "Latence: " + ChatColor.WHITE + plugin.getConnectionManager().getLastLatencyMs() + "ms");
        sender.sendMessage(ChatColor.GRAY + "Dernière sync: " + ChatColor.WHITE + lastSync);
        sender.sendMessage(ChatColor.GRAY + "Échecs consécutifs: " + ChatColor.WHITE + plugin.getConnectionManager().getConsecutiveFailures());
        sender.sendMessage(ChatColor.GRAY + "Cache: " + ChatColor.WHITE + plugin.getSessionCache().size() + " joueur(s)");
        return true;
    }
}
