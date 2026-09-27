package fr.redlakes.mc.core;

import org.bukkit.configuration.file.FileConfiguration;

/** Identité technique du serveur et paramètres de connexion au CORE — lus depuis config.yml. */
public final class CoreConfig {

    private final String apiUrl;
    private final String serverId;
    private final String syncKey;
    private final int connectTimeoutSeconds;
    private final int readTimeoutSeconds;
    private final int retryMaxAttempts;
    private final long retryBaseDelayMs;
    private final int pollIntervalMinutes;
    private final int cacheTtlMinutes;

    public CoreConfig(FileConfiguration source) {
        this.apiUrl = stripTrailingSlash(source.getString("core.url", "http://localhost:3001/api"));
        this.serverId = source.getString("core.server-id", "redlakes-main");
        this.syncKey = source.getString("core.sync-key", "");
        // request-timeout-seconds = ancienne clé unique, conservée comme valeur
        // par défaut du délai de lecture pour les config.yml déjà déployés.
        int legacyTimeout = source.getInt("core.request-timeout-seconds", 8);
        this.connectTimeoutSeconds = Math.max(1, source.getInt("core.connect-timeout-seconds", 3));
        this.readTimeoutSeconds = Math.max(1, source.getInt("core.read-timeout-seconds", legacyTimeout));
        this.retryMaxAttempts = source.getInt("core.retry.max-attempts", 3);
        this.retryBaseDelayMs = source.getLong("core.retry.base-delay-ms", 500L);
        this.pollIntervalMinutes = source.getInt("sync.poll-interval-minutes", 5);
        this.cacheTtlMinutes = source.getInt("sync.cache-ttl-minutes", 10);
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public String getServerId() {
        return serverId;
    }

    public String getSyncKey() {
        return syncKey;
    }

    public int getConnectTimeoutSeconds() {
        return connectTimeoutSeconds;
    }

    public int getReadTimeoutSeconds() {
        return readTimeoutSeconds;
    }

    public int getRetryMaxAttempts() {
        return retryMaxAttempts;
    }

    public long getRetryBaseDelayMs() {
        return retryBaseDelayMs;
    }

    public int getPollIntervalMinutes() {
        return pollIntervalMinutes;
    }

    public int getCacheTtlMinutes() {
        return cacheTtlMinutes;
    }

    public boolean isSyncKeyConfigured() {
        return syncKey != null && !syncKey.isEmpty() && !syncKey.equals("change-me-redlakes-sync-secret");
    }
}
