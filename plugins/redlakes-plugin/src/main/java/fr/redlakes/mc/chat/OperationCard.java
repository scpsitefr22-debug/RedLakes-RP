package fr.redlakes.mc.chat;

import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;

/**
 * Carte d'affectation d'opération envoyée au joueur (au lancement, à la
 * connexion pendant une opération, ou via /rl operation). N'affiche que
 * SA propre affectation — jamais la composition complète de l'opération.
 */
public final class OperationCard {

    private OperationCard() {
    }

    public static void send(Player player, MinecraftSession.EventAssignment a) {
        String rule = ChatColor.DARK_RED + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
        player.sendMessage(rule);
        player.sendMessage(ChatColor.RED + "" + ChatColor.BOLD + "AFFECTATION" + ChatColor.RESET
                + ChatColor.GRAY + " — " + ChatColor.WHITE + a.eventTitle);
        line(player, "Fonction", a.roleLabel);
        line(player, "Département", a.department != null ? a.department.name : null);
        line(player, "Secteur", a.sector);
        line(player, "Équipement", a.equipment);
        line(player, "Consigne", a.instruction);
        player.sendMessage(ChatColor.DARK_GRAY + "Canal d'opération : " + ChatColor.GRAY + "/ops <message>");
        player.sendMessage(rule);
    }

    private static void line(Player player, String label, String value) {
        if (value == null || value.isEmpty()) {
            return;
        }
        player.sendMessage(ChatColor.GRAY + label + " : " + ChatColor.WHITE + value);
    }
}
