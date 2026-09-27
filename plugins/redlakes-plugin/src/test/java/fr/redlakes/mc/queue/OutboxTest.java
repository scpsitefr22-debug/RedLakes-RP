package fr.redlakes.mc.queue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OutboxTest {

    @TempDir
    Path dir;

    private static Outbox.Entry entry(String id, String payload) {
        Outbox.Entry e = new Outbox.Entry();
        e.eventId = id;
        e.type = "REPORT";
        e.playerUuid = "00000000-0000-0000-0000-000000000001";
        e.playerName = "Testeur";
        e.payload = payload;
        e.createdAt = 1L;
        return e;
    }

    @Test
    void pendingEntriesSurviveARestartWithTheirEventIdAndAccents() throws IOException {
        File file = dir.resolve("outbox.json").toFile();
        Outbox first = new Outbox(file, 10);
        first.add(entry("e1", "{\"eventId\":\"e1\",\"subject\":\"Fuite Bloc médical\"}"));
        first.add(entry("e2", "{\"eventId\":\"e2\"}"));

        // Nouvelle instance = redémarrage du serveur.
        Outbox second = new Outbox(file, 10);
        assertEquals(2, second.load());
        assertEquals("e1", second.snapshot().get(0).eventId);
        assertTrue(second.snapshot().get(0).payload.contains("Bloc médical"));
    }

    @Test
    void removedEntriesAreGoneAfterRestart() throws IOException {
        File file = dir.resolve("outbox.json").toFile();
        Outbox outbox = new Outbox(file, 10);
        outbox.add(entry("e1", "{}"));
        outbox.add(entry("e2", "{}"));
        outbox.remove("e1");

        Outbox reloaded = new Outbox(file, 10);
        assertEquals(1, reloaded.load());
        assertEquals("e2", reloaded.snapshot().get(0).eventId);
    }

    @Test
    void failuresAreCountedAndPersisted() throws IOException {
        File file = dir.resolve("outbox.json").toFile();
        Outbox outbox = new Outbox(file, 10);
        outbox.add(entry("e1", "{}"));
        outbox.recordFailure("e1", "injoignable");
        outbox.recordFailure("e1", "HTTP 503");

        Outbox reloaded = new Outbox(file, 10);
        reloaded.load();
        assertEquals(2, reloaded.snapshot().get(0).attempts);
        assertEquals("HTTP 503", reloaded.snapshot().get(0).lastError);
    }

    @Test
    void fullQueueRefusesNewEntriesButNotAReAddOfAnExistingOne() throws IOException {
        Outbox outbox = new Outbox(dir.resolve("outbox.json").toFile(), 2);
        assertTrue(outbox.add(entry("e1", "{}")));
        assertTrue(outbox.add(entry("e2", "{}")));
        assertFalse(outbox.add(entry("e3", "{}")));
        assertTrue(outbox.add(entry("e1", "{}")));
        assertEquals(2, outbox.size());
    }

    @Test
    void missingFileMeansEmptyQueue() throws IOException {
        assertEquals(0, new Outbox(dir.resolve("absent.json").toFile(), 10).load());
    }

    @Test
    void corruptedFileIsSetAsideNeverDeleted() throws IOException {
        File file = dir.resolve("outbox.json").toFile();
        Files.write(file.toPath(), "{ pas du json".getBytes(StandardCharsets.UTF_8));

        Outbox outbox = new Outbox(file, 10);
        assertThrows(IOException.class, outbox::load);
        assertFalse(file.exists());
        File[] kept = dir.toFile().listFiles((d, name) -> name.startsWith("outbox.json.corrompu-"));
        assertEquals(1, kept.length);
    }
}
