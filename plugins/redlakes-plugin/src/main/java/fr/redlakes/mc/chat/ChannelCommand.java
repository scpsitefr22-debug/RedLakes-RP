package fr.redlakes.mc.chat;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.List;

/**
 * Canaux de chat contextuels (§18) — LOCAL/FACTION/DEPARTMENT/TEAM/OOC/STAFF.
 * Un seul executor enregistré sur plusieurs commandes (command.getName()
 * distingue le canal) — ne fait que filtrer les destinataires à partir de
 * la session déjà en cache, aucun appel réseau ici (§58-59).
 */
public final class ChannelCommand implements CommandExecutor {

    private static final double LOCAL_RADIUS = 30.0;

    private final RedLakesPlugin plugin;

    public ChannelCommand(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }
        if (args.length == 0) {
            sender.sendMessage(ChatColor.GRAY + "Usage: /" + label + " <message>");
            return true;
        }

        Player player = (Player) sender;
        String message = String.join(" ", args);

        switch (command.getName().toLowerCase()) {
            case "local":
                sendLocal(player, message);
                return true;
            case "faction":
                sendFaction(player, message);
                return true;
            case "department":
                sendDepartment(player, message);
                return true;
            case "team":
                sendTeam(player, message);
                return true;
            case "ooc":
                sendOoc(player, message);
                return true;
            case "staffchat":
                sendStaff(player, message);
                return true;
            default:
                return false;
        }
    }

    private void sendLocal(Player player, String message) {
        MinecraftSession session = requireSession(player);
        if (session == null) {
            return;
        }
        String header = ChatColor.GRAY + "[Local] " + ChatIdentity.tag(session) + ChatColor.WHITE
                + ChatIdentity.rpName(session, player.getName()) + ChatColor.GRAY + ": " + ChatColor.WHITE;

        List<Player> recipients = new ArrayList<>();
        for (Player online : Bukkit.getOnlinePlayers()) {
            if (online.getWorld().equals(player.getWorld())
                    && online.getLocation().distance(player.getLocation()) <= LOCAL_RADIUS) {
                recipients.add(online);
            }
        }
        broadcast(recipients, header + message);
    }

    private void sendFaction(Player player, String message) {
        MinecraftSession session = requireSession(player);
        if (session == null) {
            return;
        }
        if (session.faction == null || session.faction.id == null) {
            player.sendMessage(ChatColor.RED + "Aucune faction associée à ton personnage.");
            return;
        }
        String header = ChatColor.AQUA + "[Faction] " + ChatColor.WHITE
                + ChatIdentity.rpName(session, player.getName()) + ChatColor.GRAY + ": " + ChatColor.WHITE;
        broadcastToMatching(message, header,
                other -> other.faction != null && session.faction.id.equals(other.faction.id));
    }

    private void sendDepartment(Player player, String message) {
        MinecraftSession session = requireSession(player);
        if (session == null) {
            return;
        }
        if (session.department == null || session.department.id == null) {
            player.sendMessage(ChatColor.RED + "Aucun département associé à ton personnage.");
            return;
        }
        String header = ChatColor.BLUE + "[Département] " + ChatColor.WHITE
                + ChatIdentity.rpName(session, player.getName()) + ChatColor.GRAY + ": " + ChatColor.WHITE;
        broadcastToMatching(message, header,
                other -> other.department != null && session.department.id.equals(other.department.id));
    }

    private void sendTeam(Player player, String message) {
        MinecraftSession session = requireSession(player);
        if (session == null) {
            return;
        }
        if (session.team == null || session.team.id == null) {
            player.sendMessage(ChatColor.RED + "Aucune équipe associée à ton personnage.");
            return;
        }
        String header = ChatColor.LIGHT_PURPLE + "[Équipe] " + ChatColor.WHITE
                + ChatIdentity.rpName(session, player.getName()) + ChatColor.GRAY + ": " + ChatColor.WHITE;
        broadcastToMatching(message, header,
                other -> other.team != null && session.team.id.equals(other.team.id));
    }

    private void sendOoc(Player player, String message) {
        String formatted = ChatColor.DARK_GRAY + "(OOC) " + player.getName() + ChatColor.GRAY + ": "
                + ChatColor.DARK_GRAY + message;
        Bukkit.broadcastMessage(formatted);
    }

    private void sendStaff(Player player, String message) {
        if (!player.hasPermission("redlakes.staff")) {
            player.sendMessage(ChatColor.RED + "Permission refusée.");
            return;
        }
        String formatted = ChatColor.RED + "[STAFF] " + ChatColor.WHITE + player.getName()
                + ChatColor.GRAY + ": " + ChatColor.WHITE + message;

        List<Player> recipients = new ArrayList<>();
        for (Player online : Bukkit.getOnlinePlayers()) {
            if (online.hasPermission("redlakes.staff")) {
                recipients.add(online);
            }
        }
        broadcast(recipients, formatted);
    }

    private interface SessionMatcher {
        boolean matches(MinecraftSession other);
    }

    private void broadcastToMatching(String message, String header, SessionMatcher matcher) {
        List<Player> recipients = new ArrayList<>();
        for (Player online : Bukkit.getOnlinePlayers()) {
            MinecraftSession otherSession = plugin.getSessionCache().getStale(online.getUniqueId());
            if (otherSession != null && otherSession.hasCharacter && matcher.matches(otherSession)) {
                recipients.add(online);
            }
        }
        broadcast(recipients, header + message);
    }

    private void broadcast(List<Player> recipients, String formatted) {
        for (Player recipient : recipients) {
            recipient.sendMessage(formatted);
        }
    }

    private MinecraftSession requireSession(Player player) {
        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());
        if (session == null || !session.hasCharacter) {
            player.sendMessage(ChatColor.GRAY + "Aucun profil CORE synchronisé pour le moment.");
            return null;
        }
        return session;
    }
}
