package fr.redlakes.mc.player;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * §08-09 : le cache doit rester consultable même périmé (mode dégradé),
 * mais getFresh() doit refuser de servir une donnée hors TTL.
 */
class SessionCacheTest {

    @Test
    void getFreshReturnsNullForUnknownPlayer() {
        SessionCache cache = new SessionCache(10);
        assertNull(cache.getFresh(UUID.randomUUID()));
        assertNull(cache.getStale(UUID.randomUUID()));
    }

    @Test
    void putThenGetFreshReturnsTheSameSession() {
        SessionCache cache = new SessionCache(10);
        UUID uuid = UUID.randomUUID();
        MinecraftSession session = new MinecraftSession();
        session.hasCharacter = true;

        cache.put(uuid, session);

        assertEquals(session, cache.getFresh(uuid));
        assertEquals(session, cache.getStale(uuid));
    }

    @Test
    void getFreshExpiresAfterTtl() throws InterruptedException {
        // TTL 0 minute -> tout ce qui a un age > 0ms est considéré périmé.
        SessionCache cache = new SessionCache(0);
        UUID uuid = UUID.randomUUID();
        MinecraftSession session = new MinecraftSession();
        cache.put(uuid, session);

        Thread.sleep(5);

        assertNull(cache.getFresh(uuid), "getFresh() doit refuser une entrée hors TTL");
        assertNotNull(cache.getStale(uuid), "getStale() doit rester disponible même périmée (mode dégradé)");
    }

    @Test
    void removeClearsBothFreshAndStale() {
        SessionCache cache = new SessionCache(10);
        UUID uuid = UUID.randomUUID();
        cache.put(uuid, new MinecraftSession());

        cache.remove(uuid);

        assertNull(cache.getFresh(uuid));
        assertNull(cache.getStale(uuid));
    }

    @Test
    void sizeReflectsNumberOfEntries() {
        SessionCache cache = new SessionCache(10);
        assertEquals(0, cache.size());

        cache.put(UUID.randomUUID(), new MinecraftSession());
        cache.put(UUID.randomUUID(), new MinecraftSession());
        assertEquals(2, cache.size());

        cache.put(UUID.randomUUID(), new MinecraftSession());
        assertEquals(3, cache.size());
    }

    @Test
    void puttingSameUuidTwiceOverwritesRatherThanDuplicates() {
        SessionCache cache = new SessionCache(10);
        UUID uuid = UUID.randomUUID();

        MinecraftSession first = new MinecraftSession();
        first.minecraftUsername = "avant";
        cache.put(uuid, first);

        MinecraftSession second = new MinecraftSession();
        second.minecraftUsername = "apres";
        cache.put(uuid, second);

        assertEquals(1, cache.size());
        assertEquals("apres", cache.getStale(uuid).minecraftUsername);
    }
}
