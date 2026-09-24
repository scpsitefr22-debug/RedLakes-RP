package fr.redlakes.mc.zones;

import fr.redlakes.mc.player.MinecraftSession;

/**
 * Décide ALLOW/DENY pour une porte — §24 : "CanCharacterAccess(character, door)".
 * Réutilise exactement les deux axes déjà utilisés côté CORE pour les
 * documents/rapports/événements (clearanceLevel + département), jamais une
 * nouvelle couche de permissions nommées inventée ici.
 */
public final class DoorAccessResolver {

    private DoorAccessResolver() {
    }

    public static boolean canAccess(MinecraftSession session, Door door) {
        if (session == null || !session.hasCharacter || session.grade == null) {
            return false;
        }
        if (door.requiredDepartmentSlug != null) {
            if (session.department == null || session.department.slug == null
                    || !session.department.slug.equals(door.requiredDepartmentSlug)) {
                return false;
            }
        }
        return session.grade.clearanceLevel >= door.requiredClearance;
    }
}
