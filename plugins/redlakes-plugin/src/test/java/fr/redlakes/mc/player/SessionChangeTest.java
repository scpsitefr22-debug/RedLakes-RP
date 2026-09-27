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
    void currentSessionNullAfterNothingIsNotRelevant() {
        assertFalse(SessionChange.compare(null, null).isRelevant());
        assertFalse(SessionChange.compare(sessionWithoutCharacter(), null).isRelevant());
    }

    @Test
    void unlinkedAfterHavingACharacterIsCharacterLost() {
        // 404 confirmé par le CORE (compte délié) : l'identité RP doit être retirée.
        SessionChange change = SessionChange.compare(sessionWithCharacter("g1", "f1", null), null);
        assertTrue(change.characterLost);
        assertTrue(change.isRelevant());
        assertFalse(change.firstSync);
    }

    @Test
    void noActiveCharacterAnymoreIsCharacterLost() {
        SessionChange change = SessionChange.compare(sessionWithCharacter("g1", "f1", "d1"), sessionWithoutCharacter());
        assertTrue(change.characterLost);
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

    private static MinecraftSession withCharacterAndTeam(String characterId, String teamId) {
        MinecraftSession s = sessionWithCharacter("g1", "f1", "d1");
        s.characterId = characterId;
        if (teamId != null) {
            s.team = new MinecraftSession.Team();
            s.team.id = teamId;
            s.team.name = "Équipe Test";
        }
        return s;
    }

    @Test
    void detectsCharacterSwitchEvenWhenGradeFactionDepartmentAreIdentical() {
        // Deux personnages du même compte avec la même affectation : sans
        // comparaison du characterId, le changement passait inaperçu.
        SessionChange change = SessionChange.compare(withCharacterAndTeam("c1", null), withCharacterAndTeam("c2", null));
        assertTrue(change.characterChanged);
        assertTrue(change.isRelevant());
        assertFalse(change.gradeChanged);
    }

    @Test
    void sameCharacterIsNotACharacterChange() {
        SessionChange change = SessionChange.compare(withCharacterAndTeam("c1", "t1"), withCharacterAndTeam("c1", "t1"));
        assertFalse(change.characterChanged);
        assertFalse(change.teamChanged);
        assertFalse(change.isRelevant());
    }

    @Test
    void detectsTeamChange() {
        SessionChange change = SessionChange.compare(withCharacterAndTeam("c1", "t1"), withCharacterAndTeam("c1", "t2"));
        assertTrue(change.teamChanged);
        assertFalse(change.characterChanged);
        assertTrue(change.isRelevant());
    }

    @Test
    void detectsJoiningAndLeavingATeam() {
        assertTrue(SessionChange.compare(withCharacterAndTeam("c1", null), withCharacterAndTeam("c1", "t1")).teamChanged);
        assertTrue(SessionChange.compare(withCharacterAndTeam("c1", "t1"), withCharacterAndTeam("c1", null)).teamChanged);
    }

    private static MinecraftSession withAssignment(String assignmentId, String eventId) {
        MinecraftSession s = withCharacterAndTeam("c1", null);
        if (assignmentId != null) {
            s.eventAssignment = new MinecraftSession.EventAssignment();
            s.eventAssignment.id = assignmentId;
            s.eventAssignment.eventId = eventId;
            s.eventAssignment.eventTitle = "Opération Test";
            s.eventAssignment.roleLabel = "Agent de sécurité";
        }
        return s;
    }

    @Test
    void operationStartIsEventAssignedWithoutTouchingPermanentIdentity() {
        SessionChange change = SessionChange.compare(withAssignment(null, null), withAssignment("a1", "e1"));
        assertTrue(change.eventAssigned);
        assertFalse(change.eventEnded);
        assertFalse(change.gradeChanged);
        assertFalse(change.factionChanged);
        assertTrue(change.isRelevant());
    }

    @Test
    void operationCloseIsEventEnded() {
        SessionChange change = SessionChange.compare(withAssignment("a1", "e1"), withAssignment(null, null));
        assertTrue(change.eventEnded);
        assertFalse(change.eventAssigned);
        assertTrue(change.isRelevant());
    }

    @Test
    void sameAssignmentOnNextPollIsSilent() {
        SessionChange change = SessionChange.compare(withAssignment("a1", "e1"), withAssignment("a1", "e1"));
        assertFalse(change.eventAssigned);
        assertFalse(change.eventEnded);
        assertFalse(change.isRelevant());
    }

    @Test
    void reassignmentProducesANewCardNotAnEnd() {
        SessionChange change = SessionChange.compare(withAssignment("a1", "e1"), withAssignment("a2", "e2"));
        assertTrue(change.eventAssigned);
        assertFalse(change.eventEnded);
    }

    @Test
    void joiningDuringAnActiveOperationShowsTheCard() {
        SessionChange change = SessionChange.compare(null, withAssignment("a1", "e1"));
        assertTrue(change.firstSync);
        assertTrue(change.eventAssigned);
    }
}
