package fr.redlakes.mc.core;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * État de santé de la connexion au CORE — mis à jour uniquement depuis un
 * thread async par CoreClient/SessionSyncService, jamais depuis le thread
 * principal Minecraft. ONLINE -> premier échec => DEGRADED -> 3 échecs
 * consécutifs => OFFLINE. Un succès ramène immédiatement à ONLINE.
 */
public final class ConnectionManager {

    private static final int FAILURES_BEFORE_OFFLINE = 3;

    private final AtomicReference<ConnectionState> state = new AtomicReference<>(ConnectionState.OFFLINE);
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private final AtomicLong lastSuccessAt = new AtomicLong(-1);
    private final AtomicLong lastLatencyMs = new AtomicLong(-1);

    public void recordSuccess(long latencyMs) {
        consecutiveFailures.set(0);
        lastSuccessAt.set(System.currentTimeMillis());
        lastLatencyMs.set(latencyMs);
        state.set(ConnectionState.ONLINE);
    }

    public void recordFailure() {
        int failures = consecutiveFailures.incrementAndGet();
        state.set(failures >= FAILURES_BEFORE_OFFLINE ? ConnectionState.OFFLINE : ConnectionState.DEGRADED);
    }

    public ConnectionState getState() {
        return state.get();
    }

    public long getLastSuccessAt() {
        return lastSuccessAt.get();
    }

    public long getLastLatencyMs() {
        return lastLatencyMs.get();
    }

    public int getConsecutiveFailures() {
        return consecutiveFailures.get();
    }
}
