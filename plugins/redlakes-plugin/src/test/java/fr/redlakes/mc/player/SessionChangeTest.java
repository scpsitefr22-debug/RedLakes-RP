package fr.redlakes.mc.player;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Vérifie la détection de changement (§12-13) sans dépendre de Bukkit —
 * MinecraftSession/SessionChange sont du Java pur, testables directement.
 */
class SessionChangeTest {

    private static MinecraftSession sessionWithCharacter(String gradeId, String factionId, String departmentId) {
        MinecraftSession s = new MinecraftSession();
        s.hasCharacter = true;

        s.grade = new MinecraftSession.Grade();
        s.grade.id = gradeId;
        s.grade.name = "Grade Test";
        s.grade.clearanceLevel = 1;

        s.faction = new MinecraftSession.Faction();
        s.faction.id = factionId;
        s.faction.name = "Faction Test";
        s.faction.showAffiliationTag = true;

        if (departmentId != null) {
            s.department = new MinecraftSession.Department();
            s.department.id = departmentId;
            s.department.name = "Département Test";
        }

        return s;
    }

    private static MinecraftSession sessionWithoutCharacter() {
        MinecraftSession s = new MinecraftSession();
        s.linked = true;
        s.hasCharacter = false;
        return s;
    }

    @Test
    void currentSessionWithoutCharacterIsNeverRelevant() {
        SessionChange change = SessionChange.compare(null, sessionWithoutCharacter());
        assertFalse(change.isRelevant());
    }

    @Test
    void currentSessionNullIsNeverRelevant() {
        SessionChange change = SessionChange.compare(sessionWithCharacter("g1", "f1", null), null);
        assertFalse(change.isRelevant());
    }

    @Test
    void firstSyncWhenNoPreviousSession() {
        SessionChange change = SessionChange.compare(null, sessionWithCharacter("g1", "f1", "d1"));
        assertTrue(change.firstSync);
        assertTrue(change.isRelevant());
        assertFalse(change.gradeChanged);
        assertFalse(change.factionChanged);
    }

    @Test
    void firstSyncWhenPreviousHadNoCharacter() {
        SessionChange change = SessionChange.compare(sessionWithoutCharacter(), sessionWithCharacter("g1", "f1", "d1"));
        assertTrue(change.firstSync);
    }

    @Test
    void noChangeWhenIdsAreIdentical() {
        MinecraftSession previous = sessionWithCharacter("g1", "f1", "d1");
        MinecraftSession current = sessionWithCharacter("g1", "f1", "d1");
        SessionChange change = SessionChange.compare(previous, current);

        assertFalse(change.isRelevant());
        assertFalse(change.gradeChanged);
        assertFalse(change.factionChanged);
        assertFalse(change.departmentChanged);
    }

    @Test
    void detectsGradeChangeOnly() {
        MinecraftSession previous = sessionWithCharacter("g1", "f1", "d1");
        MinecraftSession current = sessionWithCharacter("g2", "f1", "d1");
        SessionChange change = SessionChange.compare(previous, current);

        assertTrue(change.gradeChanged);
        assertFalse(change.factionChanged);
        assertFalse(change.departmentChanged);
        assertTrue(change.isRelevant());
    }

    @Test
    void detectsFactionChangeOnly() {
        MinecraftSession previous = sessionWithCharacter("g1", "f1", "d1");
        MinecraftSession current = sessionWithCharacter("g1", "f2", "d1");
        SessionChange change = SessionChange.compare(previous, current);

        assertFalse(change.gradeChanged);
        assertTrue(change.factionChanged);
        assertFalse(change.departmentChanged);
    }

    @Test
    void detectsDepartmentChangeIncludingNullTransitions() {
        MinecraftSession previous = sessionWithCharacter("g1", "f1", "d1");
        MinecraftSession current = sessionWithCharacter("g1", "f1", null);
        SessionChange change = SessionChange.compare(previous, current);

        assertTrue(change.departmentChanged);
    }

    @Test
    void twoNullGradeIdsAreNotTreatedAsAChange() {
        // Grade texte libre sans correspondance catalogue côté CORE (gradeId
        // null des deux côtés) — ne doit jamais déclencher un faux GradeChanged.
        MinecraftSession previous = sessionWithCharacter(null, "f1", "d1");
        MinecraftSession current = sessionWithCharacter(null, "f1", "d1");
        SessionChange change = SessionChange.compare(previous, current);

        assertFalse(change.gradeChanged);
        assertFalse(change.isRelevant());
    }

    @Test
    void nullToNonNullGradeIdIsAChange() {
        MinecraftSession previous = sessionWithCharacter(null, "f1", "d1");
        MinecraftSession current = sessionWithCharacter("g1", "f1", "d1");
        SessionChange change = SessionChange.compare(previous, current);

        assertTrue(change.gradeChanged);
    }
}
