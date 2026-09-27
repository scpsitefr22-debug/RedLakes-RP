package fr.redlakes.mc.core;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Vrai serveur HTTP local (JDK, aucune dépendance) : vérifie le
 * comportement réel du client sur 2xx, 4xx, 5xx, timeout et API éteinte.
 */
class CoreClientTest {

    private static final Logger LOGGER = Logger.getLogger("CoreClientTest");

    private HttpServer server;
    private String baseUrl;
    private final AtomicInteger hits = new AtomicInteger();
    private final AtomicReference<String> receivedKey = new AtomicReference<>();

    @BeforeEach
    void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        baseUrl = "http://127.0.0.1:" + server.getAddress().getPort() + "/api";
        // Plusieurs threads : sinon une requête lente bloque la suivante dans
        // la file du serveur de test, ce qui fausse le comptage des tentatives.
        server.setExecutor(Executors.newFixedThreadPool(4));
        server.start();
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    /** Répond statuses[i] au i-ème appel (le dernier se répète ensuite). */
    private void respond(int... statuses) {
        server.createContext("/api/test", exchange -> {
            receivedKey.set(exchange.getRequestHeaders().getFirst("X-Redlakes-Sync-Key"));
            int i = hits.getAndIncrement();
            int status = statuses[Math.min(i, statuses.length - 1)];
            byte[] body = ("{\"call\":" + i + "}").getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status, body.length);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(body);
            }
        });
    }

    private CoreClient client(int maxAttempts, int readTimeoutMs) {
        return new CoreClient(baseUrl, "cle-test", 1000, readTimeoutMs, new RetryPolicy(maxAttempts, 10, 50), LOGGER);
    }

    @Test
    void successIsReturnedAfterOneAttemptWithSyncKeyHeader() throws Exception {
        respond(200);
        CoreClient.Response response = client(3, 1000).get("/test");
        assertEquals(200, response.status);
        assertEquals(1, response.attempts);
        assertEquals(1, hits.get());
        assertEquals("cle-test", receivedKey.get());
    }

    @Test
    void clientErrorsAreNeverRetried() throws Exception {
        respond(404);
        CoreClient.Response response = client(3, 1000).get("/test");
        assertEquals(404, response.status);
        assertEquals(1, hits.get());
    }

    @Test
    void unauthorizedIsNeverRetried() throws Exception {
        respond(401);
        assertEquals(401, client(3, 1000).get("/test").status);
        assertEquals(1, hits.get());
    }

    @Test
    void transientServerErrorIsRetriedUntilSuccess() throws Exception {
        respond(503, 200);
        CoreClient.Response response = client(3, 1000).get("/test");
        assertEquals(200, response.status);
        assertEquals(2, response.attempts);
        assertEquals(2, hits.get());
    }

    @Test
    void persistentServerErrorStopsAtMaxAttempts() throws Exception {
        respond(500);
        CoreClient.Response response = client(3, 1000).get("/test");
        assertEquals(500, response.status);
        assertEquals(3, hits.get());
    }

    @Test
    void callerCanLimitAttemptsBelowThePolicy() throws Exception {
        respond(500);
        client(3, 1000).get("/test", 1);
        assertEquals(1, hits.get());
    }

    @Test
    void callerCannotExceedThePolicy() throws Exception {
        respond(500);
        client(2, 1000).get("/test", 10);
        assertEquals(2, hits.get());
    }

    @Test
    void readTimeoutIsRetriedThenThrows() {
        server.createContext("/api/slow", exchange -> {
            hits.incrementAndGet();
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        assertThrows(CoreClient.CoreClientException.class, () -> client(2, 100).get("/slow"));
        assertEquals(2, hits.get());
    }

    @Test
    void unreachableApiThrowsAfterRetries() throws Exception {
        int freePort;
        try (ServerSocket socket = new ServerSocket(0)) {
            freePort = socket.getLocalPort();
        }
        CoreClient offline = new CoreClient("http://127.0.0.1:" + freePort + "/api", "cle-test",
                300, 300, new RetryPolicy(3, 10, 50), LOGGER);
        assertThrows(CoreClient.CoreClientException.class, () -> offline.get("/test"));
    }
}
