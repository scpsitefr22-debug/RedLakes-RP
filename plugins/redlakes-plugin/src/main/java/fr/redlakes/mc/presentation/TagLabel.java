package fr.redlakes.mc.presentation;

import fr.redlakes.mc.player.MinecraftSession;

/**
 * Dérivation du texte court affiché en nametag/tablist/chat (§19-20) —
 * partagée entre PresentationManager et ChatFormatListener pour garantir
 * qu'ils restent toujours cohérents entre eux (une seule règle de troncature).
 * Aucune donnée RP en dur ici : tout part du département/faction déjà
 * résolus côté CORE, et de Faction.showAffiliationTag pour le masquage.
 */
public final class TagLabel {

    private static final int MAX_LENGTH = 4;

    private TagLabel() {
    }

    public static boolean shouldShow(MinecraftSession session) {
        return session.faction != null && session.faction.showAffiliationTag;
    }

    /** Département si connu, sinon faction — tronqué pour tenir dans un préfixe de team (16 caractères max en 1.12.2). */
    public static String shortLabel(MinecraftSession session) {
        if (!shouldShow(session)) {
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
        return upper.length() > MAX_LENGTH ? upper.substring(0, MAX_LENGTH) : upper;
    }
}
