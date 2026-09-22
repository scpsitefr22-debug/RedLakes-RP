package fr.redlakes.mc.player;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cache mémoire des sessions CORE — §08-09 du cahier des charges : sert
 * uniquement à maintenir le serveur opérationnel si le CORE est
 * temporairement injoignable, jamais une seconde source de vérité.
 */
public final class SessionCache {

    private static final class Entry {
        final MinecraftSession session;
        final long fetchedAt;

        Entry(MinecraftSession session, long fetchedAt) {
            this.session = session;
            this.fetchedAt = fetchedAt;
        }
    }

    private final Map<UUID, Entry> entries = new ConcurrentHashMap<>();
    private final long ttlMillis;

    public SessionCache(int ttlMinutes) {
        this.ttlMillis = ttlMinutes * 60_000L;
    }

    public void put(UUID uuid, MinecraftSession session) {
        entries.put(uuid, new Entry(session, System.currentTimeMillis()));
    }

    /** Session dans le TTL, ou null si absente/périmée. */
    public MinecraftSession getFresh(UUID uuid) {
        Entry entry = entries.get(uuid);
        if (entry == null) {
            return null;
        }
        boolean expired = System.currentTimeMillis() - entry.fetchedAt > ttlMillis;
        return expired ? null : entry.session;
    }

    /** Dernière session connue même périmée — mode dégradé/offline uniquement. */
    public MinecraftSession getStale(UUID uuid) {
        Entry entry = entries.get(uuid);
        return entry == null ? null : entry.session;
    }

    public void remove(UUID uuid) {
        entries.remove(uuid);
    }

    public int size() {
        return entries.size();
    }
}
