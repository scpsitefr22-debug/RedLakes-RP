package fr.redlakes.mc.zones;

import fr.redlakes.mc.player.MinecraftSession;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DoorAccessResolverTest {

    private static MinecraftSession session(int clearance, String departmentSlug) {
        MinecraftSession s = new MinecraftSession();
        s.hasCharacter = true;
        s.grade = new MinecraftSession.Grade();
        s.grade.clearanceLevel = clearance;
        if (departmentSlug != null) {
            s.department = new MinecraftSession.Department();
            s.department.slug = departmentSlug;
        }
        return s;
    }

    @Test
    void deniesWhenSessionIsNull() {
        Door door = new Door("world", 0, 0, 0, 1, null);
        assertFalse(DoorAccessResolver.canAccess(null, door));
    }

    @Test
    void deniesWhenNoActiveCharacter() {
        MinecraftSession s = new MinecraftSession();
        s.hasCharacter = false;
        Door door = new Door("world", 0, 0, 0, 1, null);
        assertFalse(DoorAccessResolver.canAccess(s, door));
    }

    @Test
    void allowsWhenClearanceMeetsRequirementAndNoDepartmentRequired() {
        Door door = new Door("world", 0, 0, 0, 3, null);
        assertTrue(DoorAccessResolver.canAccess(session(3, null), door));
        assertTrue(DoorAccessResolver.canAccess(session(5, null), door));
    }

    @Test
    void deniesWhenClearanceIsBelowRequirement() {
        Door door = new Door("world", 0, 0, 0, 4, null);
        assertFalse(DoorAccessResolver.canAccess(session(3, null), door));
    }

    @Test
    void deniesWhenDepartmentDoesNotMatchEvenWithHighClearance() {
        Door door = new Door("world", 0, 0, 0, 1, "security");
        assertFalse(DoorAccessResolver.canAccess(session(5, "research"), door));
    }

    @Test
    void deniesWhenDepartmentRequiredButPlayerHasNone() {
        Door door = new Door("world", 0, 0, 0, 1, "security");
        assertFalse(DoorAccessResolver.canAccess(session(5, null), door));
    }

    @Test
    void allowsWhenDepartmentMatchesAndClearanceSufficient() {
        Door door = new Door("world", 0, 0, 0, 3, "security");
        assertTrue(DoorAccessResolver.canAccess(session(3, "security"), door));
    }

    @Test
    void deniesWhenDepartmentMatchesButClearanceInsufficient() {
        Door door = new Door("world", 0, 0, 0, 4, "security");
        assertFalse(DoorAccessResolver.canAccess(session(3, "security"), door));
    }
}
