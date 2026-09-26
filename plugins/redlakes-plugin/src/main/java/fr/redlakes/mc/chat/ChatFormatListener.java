package fr.redlakes.mc.chat;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;

/**
 * Chat global reformaté avec l'identité RP (§17). Lit uniquement le cache
 * déjà rempli par SessionSyncService — jamais d'appel réseau ici (§58-59).
 * Ne couvre pour l'instant que le canal GLOBAL ; les canaux LOCAL/FACTION/
 * DEPARTMENT/RADIO/OOC/STAFF (§18) restent à construire (Phase 3+).
 */
public final class ChatFormatListener implements Listener {

    private final RedLakesPlugin plugin;

    public ChatFormatListener(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    // HIGHEST : le format doit rester le dernier appliqué si un autre plugin
    // de chat tente aussi d'écrire dessus (vérifié pour ChatManager, qui a
    // son propre formatage RP explicitement désactivé sur ce serveur).
    @EventHandler(priority = EventPriority.HIGHEST)
    public void onChat(AsyncPlayerChatEvent event) {
        Player player = event.getPlayer();
        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());

        if (session == null || !session.hasCharacter) {
            return;
        }

        String rpName = ChatIdentity.rpName(session, player.getName());
        String tag = ChatIdentity.tag(session);
        String header = tag + ChatColor.WHITE + rpName + ChatColor.GRAY + " : " + ChatColor.WHITE;

        // %2$s reste le seul emplacement de substitution — echapper tout '%'
        // venant des donnees CORE (nom RP/departement) pour ne pas casser
        // String.format cote Bukkit.
        event.setFormat(header.replace("%", "%%") + "%2$s");
    }
}
