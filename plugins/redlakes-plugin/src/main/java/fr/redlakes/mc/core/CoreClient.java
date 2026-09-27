package fr.redlakes.mc.core;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

/**
 * Client HTTP centralisé vers REDLAKES CORE. Toute méthode ici est
 * bloquante (y compris les pauses entre tentatives) — l'appelant est seul
 * responsable de ne jamais l'invoquer depuis le thread principal Minecraft
 * (cf. §58-59 du cahier des charges).
 */
public final class CoreClient {

    public static final class Response {
        public final int status;
        public final String body;
        public final int attempts;

        Response(int status, String body, int attempts) {
            this.status = status;
            this.body = body;
            this.attempts = attempts;
        }
    }

    public static final class CoreClientException extends Exception {
        public CoreClientException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    private final String apiUrl;
    private final String syncKey;
    private final int connectTimeoutMs;
    private final int readTimeoutMs;
    private final RetryPolicy retryPolicy;
    private final Logger logger;

    public CoreClient(CoreConfig config, Logger logger) {
        this(config.getApiUrl(), config.getSyncKey(),
                config.getConnectTimeoutSeconds() * 1000, config.getReadTimeoutSeconds() * 1000,
                new RetryPolicy(config.getRetryMaxAttempts(), config.getRetryBaseDelayMs(), 5_000L),
                logger);
    }

    /** Constructeur sans Bukkit, utilisé par les tests. */
    public CoreClient(String apiUrl, String syncKey, int connectTimeoutMs, int readTimeoutMs,
                      RetryPolicy retryPolicy, Logger logger) {
        this.apiUrl = apiUrl;
        this.syncKey = syncKey;
        this.connectTimeoutMs = connectTimeoutMs;
        this.readTimeoutMs = readTimeoutMs;
        this.retryPolicy = retryPolicy;
        this.logger = logger;
    }

    public int getMaxAttempts() {
        return retryPolicy.getMaxAttempts();
    }

    public Response get(String path) throws CoreClientException {
        return get(path, retryPolicy.getMaxAttempts());
    }

    /**
     * {@code maxAttempts} permet à l'appelant de couper court (ex. 1 seule
     * tentative quand le CORE est déjà OFFLINE, pour ne pas bloquer le
     * rafraîchissement de tous les joueurs sur des pauses inutiles).
     */
    public Response get(String path, int maxAttempts) throws CoreClientException {
        return request("GET", path, null, maxAttempts);
    }

    /**
     * POST JSON. Retenté comme un GET : sans risque uniquement parce que
     * chaque écriture envoyée par le plugin porte une clé d'idempotence
     * (eventId) que le CORE déduplique — ne jamais appeler sans.
     */
    public Response postJson(String path, String jsonBody, int maxAttempts) throws CoreClientException {
        return request("POST", path, jsonBody, maxAttempts);
    }

    private Response request(String method, String path, String jsonBody, int maxAttempts) throws CoreClientException {
        int attempts = Math.max(1, Math.min(maxAttempts, retryPolicy.getMaxAttempts()));
        IOException lastError = null;
        Response lastResponse = null;

        for (int attempt = 1; attempt <= attempts; attempt++) {
            if (attempt > 1 && !pause(retryPolicy.delayBeforeAttempt(attempt))) {
                break;
            }
            try {
                lastResponse = send(method, path, jsonBody, attempt);
                lastError = null;
                if (!RetryPolicy.isRetryableStatus(lastResponse.status)) {
                    return lastResponse;
                }
                logger.warning("CORE a répondu " + lastResponse.status + " sur " + path
                        + " (tentative " + attempt + "/" + attempts + ")");
            } catch (IOException e) {
                lastError = e;
                lastResponse = null;
                if (attempt < attempts) {
                    logger.warning("CORE injoignable sur " + path + " (tentative " + attempt + "/" + attempts
                            + ") : " + e.getClass().getSimpleName());
                }
            }
        }

        if (lastResponse != null) {
            return lastResponse;
        }
        throw new CoreClientException("Requête CORE injoignable: " + path, lastError);
    }

    private Response send(String method, String path, String jsonBody, int attempt) throws IOException {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(apiUrl + path);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(method);
            connection.setConnectTimeout(connectTimeoutMs);
            connection.setReadTimeout(readTimeoutMs);
            connection.setRequestProperty("X-Redlakes-Sync-Key", syncKey);
            connection.setRequestProperty("Accept", "application/json");
            if (jsonBody != null) {
                byte[] bytes = jsonBody.getBytes(StandardCharsets.UTF_8);
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                connection.setFixedLengthStreamingMode(bytes.length);
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(bytes);
                }
            }

            int status = connection.getResponseCode();
            InputStream stream = (status >= 200 && status < 300)
                    ? connection.getInputStream()
                    : connection.getErrorStream();
            String body = stream == null ? "" : readAll(stream);
            return new Response(status, body, attempt);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    /** false si le thread a été interrompu (arrêt du plugin) — on arrête alors de retenter. */
    private static boolean pause(long delayMs) {
        if (delayMs <= 0) {
            return true;
        }
        try {
            Thread.sleep(delayMs);
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private static String readAll(InputStream stream) throws IOException {
        StringBuilder builder = new StringBuilder();
        try (InputStreamReader reader = new InputStreamReader(stream, StandardCharsets.UTF_8)) {
            char[] buffer = new char[1024];
            int read;
            while ((read = reader.read(buffer)) != -1) {
                builder.append(buffer, 0, read);
            }
        }
        return builder.toString();
    }
}
