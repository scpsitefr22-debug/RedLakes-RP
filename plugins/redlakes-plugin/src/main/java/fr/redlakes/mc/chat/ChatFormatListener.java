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

        String rpName = rpName(session, player.getName());
        String tag = tag(session);
        String header = tag + ChatColor.WHITE + rpName + ChatColor.GRAY + " : " + ChatColor.WHITE;

        // %2$s reste le seul emplacement de substitution — echapper tout '%'
        // venant des donnees CORE (nom RP/departement) pour ne pas casser
        // String.format cote Bukkit.
        event.setFormat(header.replace("%", "%%") + "%2$s");
    }

    private String rpName(MinecraftSession session, String fallback) {
        if (session.rpFirstName != null && !session.rpFirstName.trim().isEmpty()) {
            String last = session.rpLastName != null ? " " + session.rpLastName : "";
            return session.rpFirstName + last;
        }
        return fallback;
    }

    private String tag(MinecraftSession session) {
        if (session.faction == null || !session.faction.showAffiliationTag) {
            return "";
        }
        String source = session.department != null && session.department.name != null
                ? session.department.name
                : session.faction.name;
        if (source == null || source.trim().isEmpty()) {
            return "";
        }
        String firstWord = source.trim().split("\\s+")[0];
        String upper = firstWord.toUpperCase();
        String label = upper.length() > 4 ? upper.substring(0, 4) : upper;
        return ChatColor.GRAY + "[" + label + "] ";
    }
}
