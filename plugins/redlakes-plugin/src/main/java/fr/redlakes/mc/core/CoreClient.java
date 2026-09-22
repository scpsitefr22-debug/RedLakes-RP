package fr.redlakes.mc.core;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

/**
 * Client HTTP centralisé vers REDLAKES CORE. Toute méthode ici est
 * bloquante — l'appelant est seul responsable de ne jamais l'invoquer
 * depuis le thread principal Minecraft (cf. §58-59 du cahier des charges).
 */
public final class CoreClient {

    public static final class Response {
        public final int status;
        public final String body;

        Response(int status, String body) {
            this.status = status;
            this.body = body;
        }
    }

    public static final class CoreClientException extends Exception {
        public CoreClientException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    private final CoreConfig config;
    private final Logger logger;

    public CoreClient(CoreConfig config, Logger logger) {
        this.config = config;
        this.logger = logger;
    }

    public Response get(String path) throws CoreClientException {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(config.getApiUrl() + path);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(config.getRequestTimeoutSeconds() * 1000);
            connection.setReadTimeout(config.getRequestTimeoutSeconds() * 1000);
            connection.setRequestProperty("X-Redlakes-Sync-Key", config.getSyncKey());
            connection.setRequestProperty("Accept", "application/json");

            int status = connection.getResponseCode();
            InputStream stream = (status >= 200 && status < 300)
                    ? connection.getInputStream()
                    : connection.getErrorStream();
            String body = stream == null ? "" : readAll(stream);

            if (status >= 500) {
                logger.warning("CORE a répondu " + status + " sur " + path);
            }

            return new Response(status, body);
        } catch (IOException e) {
            throw new CoreClientException("Requête CORE injoignable: " + path, e);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
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
