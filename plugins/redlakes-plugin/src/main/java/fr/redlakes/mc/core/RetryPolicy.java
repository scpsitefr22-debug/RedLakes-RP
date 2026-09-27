package fr.redlakes.mc.core;

/**
 * Nouvelles tentatives bornées vers le CORE (§05 du cahier des charges).
 * Java pur, sans Bukkit — testable directement. Ne retente que les échecs
 * transitoires (réseau, 5xx, 408, 429), jamais un 4xx qui ne changera pas
 * en recommençant (clé invalide, UUID inconnu...).
 */
public final class RetryPolicy {

    private final int maxAttempts;
    private final long baseDelayMs;
    private final long maxDelayMs;

    public RetryPolicy(int maxAttempts, long baseDelayMs, long maxDelayMs) {
        this.maxAttempts = Math.max(1, Math.min(maxAttempts, 5));
        this.baseDelayMs = Math.max(0, baseDelayMs);
        this.maxDelayMs = Math.max(this.baseDelayMs, maxDelayMs);
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public static boolean isRetryableStatus(int status) {
        return status >= 500 || status == 408 || status == 429;
    }

    /**
     * Délai avant la tentative numéro {@code attempt} (2 = première
     * nouvelle tentative) : base, puis doublé à chaque fois, plafonné.
     */
    public long delayBeforeAttempt(int attempt) {
        if (attempt <= 1) {
            return 0;
        }
        long delay = baseDelayMs;
        for (int i = 2; i < attempt && delay < maxDelayMs; i++) {
            delay *= 2;
        }
        return Math.min(delay, maxDelayMs);
    }
}
