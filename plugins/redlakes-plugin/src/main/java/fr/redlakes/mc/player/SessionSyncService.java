package fr.redlakes.mc.player;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import fr.redlakes.mc.core.ConnectionManager;
import fr.redlakes.mc.core.CoreClient;

import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Récupère le contexte CORE d'un joueur par UUID. Bloquant — appelé
 * exclusivement depuis un thread asynchrone du scheduler Bukkit (jamais
 * dans onPlayerMove/onTick/etc., voir §58 du cahier des charges).
 */
public final class SessionSyncService {

    private final CoreClient client;
    private final ConnectionManager connectionManager;
    private final SessionCache cache;
    private final Gson gson = new Gson();
    private final Logger logger;

    public SessionSyncService(CoreClient client, ConnectionManager connectionManager, SessionCache cache, Logger logger) {
        this.client = client;
        this.connectionManager = connectionManager;
        this.cache = cache;
        this.logger = logger;
    }

    /** Session fraîchement récupérée, ou null si le joueur n'est pas (encore) lié côté CORE. */
    public MinecraftSession fetch(UUID uuid, String usernameForLogs) {
        long start = System.currentTimeMillis();
        try {
            CoreClient.Response response = client.get("/sync/minecraft/" + uuid);
            long latency = System.currentTimeMillis() - start;

            if (response.status == 404) {
                connectionManager.recordSuccess(latency);
                cache.remove(uuid);
                return null;
            }
            if (response.status < 200 || response.status >= 300) {
                connectionManager.recordFailure();
                logger.warning("Sync CORE échouée (" + response.status + ") pour " + usernameForLogs);
                return null;
            }

            MinecraftSession session = gson.fromJson(response.body, MinecraftSession.class);
            if (session == null) {
                // Corps 200 vide ou littéralement "null" — Gson ne lève pas
                // d'exception dans ce cas. ConcurrentHashMap#put refuse les
                // valeurs null (NullPointerException immédiate) : ne jamais
                // mettre en cache, traiter comme un échec de sync.
                connectionManager.recordFailure();
                logger.warning("Réponse CORE vide pour " + usernameForLogs);
                return null;
            }
            connectionManager.recordSuccess(latency);
            cache.put(uuid, session);
            return session;
        } catch (CoreClient.CoreClientException e) {
            connectionManager.recordFailure();
            logger.log(Level.WARNING, "CORE injoignable pour " + usernameForLogs, e);
            return null;
        } catch (JsonSyntaxException e) {
            connectionManager.recordFailure();
            logger.log(Level.WARNING, "Réponse CORE invalide pour " + usernameForLogs, e);
            return null;
        } catch (RuntimeException e) {
            // Filet de sécurité : une session async ne doit jamais faire
            // remonter une exception non catchée jusqu'au scheduler Bukkit
            // (risque d'annuler la tâche périodique pour tous les joueurs).
            connectionManager.recordFailure();
            logger.log(Level.WARNING, "Erreur inattendue lors de la sync pour " + usernameForLogs, e);
            return null;
        }
    }
}
