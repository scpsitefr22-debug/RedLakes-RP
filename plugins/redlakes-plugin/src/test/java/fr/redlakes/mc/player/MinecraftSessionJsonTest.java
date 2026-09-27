package fr.redlakes.mc.player;

import com.google.gson.Gson;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Lit de vraies réponses GET /sync/minecraft/:uuid capturées sur l'API
 * locale (compte de test, 27/09/2026) — garantit que MinecraftSession
 * reste un miroir exact du contrat CORE, accents compris.
 */
class MinecraftSessionJsonTest {

    private static MinecraftSession load(String name) throws Exception {
        try (InputStream in = MinecraftSessionJsonTest.class.getResourceAsStream("/" + name)) {
            assertNotNull(in, "fixture manquante : " + name);
            return new Gson().fromJson(new InputStreamReader(in, StandardCharsets.UTF_8), MinecraftSession.class);
        }
    }

    @Test
    void sessionDuringAnOperationCarriesTheAssignment() throws Exception {
        MinecraftSession session = load("session-with-operation.json");
        assertTrue(session.hasCharacter);
        assertNotNull(session.eventAssignment);
        assertNotNull(session.eventAssignment.id);
        assertNotNull(session.eventAssignment.eventId);
        assertEquals("Agent de sécurité", session.eventAssignment.roleLabel);
        assertEquals("Bloc administratif", session.eventAssignment.sector);
        assertEquals("securite", session.eventAssignment.department.slug);
    }

    @Test
    void closingTheOperationLeavesThePermanentGradeIntact() throws Exception {
        MinecraftSession during = load("session-with-operation.json");
        MinecraftSession after = load("session-after-operation.json");

        assertNull(after.eventAssignment);
        assertEquals(during.grade.name, after.grade.name);
        assertEquals(during.faction.id, after.faction.id);
        assertEquals(during.characterId, after.characterId);

        SessionChange change = SessionChange.compare(during, after);
        assertTrue(change.eventEnded);
        assertTrue(!change.gradeChanged && !change.factionChanged && !change.characterChanged);
    }
}
