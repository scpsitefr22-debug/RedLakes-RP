package fr.redlakes.mc.presentation;

import com.comphenix.protocol.PacketType;
import com.comphenix.protocol.ProtocolLibrary;
import com.comphenix.protocol.ProtocolManager;
import com.comphenix.protocol.events.PacketContainer;
import com.comphenix.protocol.wrappers.WrappedChatComponent;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.plugin.Plugin;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Bandeau tablist (§20) — nécessite ProtocolLib, absent de l'API Spigot pure
 * en 1.12.2. Dégradation silencieuse si ProtocolLib n'est pas chargé
 * (softdepend dans plugin.yml) : ce plugin ne doit jamais dépendre d'un
 * tiers pour fonctionner, seulement en tirer parti quand il est là.
 */
public final class TabListManager {

    private final boolean available;
    private final ProtocolManager protocolManager;
    private final Logger logger;

    public TabListManager(Plugin plugin, Logger logger) {
        this.logger = logger;
        boolean present = plugin.getServer().getPluginManager().getPlugin("ProtocolLib") != null;
        this.protocolManager = present ? ProtocolLibrary.getProtocolManager() : null;
        this.available = present;
        if (!present) {
            logger.info("ProtocolLib absent — bandeau tablist désactivé (dégradation silencieuse).");
        }
    }

    public void applyToPlayer(Player player, MinecraftSession session) {
        if (!available) {
            return;
        }
        try {
            PacketContainer packet = protocolManager.createPacket(PacketType.Play.Server.PLAYER_LIST_HEADER_FOOTER);
            packet.getChatComponents().write(0, WrappedChatComponent.fromText(header()));
            packet.getChatComponents().write(1, WrappedChatComponent.fromText(footer(session)));
            protocolManager.sendServerPacket(player, packet);
        } catch (Exception e) {
            logger.log(Level.WARNING, "Échec envoi bandeau tablist à " + player.getName(), e);
        }
    }

    private String header() {
        return ChatColor.GOLD + "" + ChatColor.BOLD + "REDLAKES" + ChatColor.RESET + ChatColor.GRAY + " CORE";
    }

    private String footer(MinecraftSession session) {
        if (session == null || !session.hasCharacter) {
            return ChatColor.DARK_GRAY + "Compte non lié au CORE";
        }
        return ChatColor.GRAY + session.grade.name + ChatColor.DARK_GRAY + " — " + ChatColor.GRAY + session.faction.name;
    }
}
