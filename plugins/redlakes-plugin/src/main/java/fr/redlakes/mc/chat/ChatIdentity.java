package fr.redlakes.mc.chat;

import fr.redlakes.mc.player.MinecraftSession;
import fr.redlakes.mc.presentation.TagLabel;
import org.bukkit.ChatColor;

/**
 * Nom RP + tag affichés devant un message — extrait de ChatFormatListener
 * pour être réutilisé par les canaux de chat (LOCAL/FACTION/...) sans
 * dupliquer la même règle à plusieurs endroits.
 */
public final class ChatIdentity {

    private ChatIdentity() {
    }

    public static String rpName(MinecraftSession session, String fallback) {
        if (session.rpFirstName != null && !session.rpFirstName.trim().isEmpty()) {
            String last = session.rpLastName != null ? " " + session.rpLastName : "";
            return session.rpFirstName + last;
        }
        return fallback;
    }

    public static String tag(MinecraftSession session) {
        String label = TagLabel.shortLabel(session);
        return label.isEmpty() ? "" : ChatColor.GRAY + "[" + label + "] ";
    }
}
