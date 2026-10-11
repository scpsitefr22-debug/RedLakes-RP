package fr.redlakes.mc;

import fr.redlakes.mc.chat.ChannelCommand;
import fr.redlakes.mc.chat.ChatFormatListener;
import fr.redlakes.mc.chat.WhisperCommand;
import fr.redlakes.mc.commands.RlCommand;
import fr.redlakes.mc.core.ConnectionManager;
import fr.redlakes.mc.core.CoreClient;
import fr.redlakes.mc.core.CoreConfig;
import fr.redlakes.mc.player.PlayerConnectionListener;
import fr.redlakes.mc.player.SessionCache;
import fr.redlakes.mc.player.SessionSyncService;
import fr.redlakes.mc.presentation.PresentationManager;
import fr.redlakes.mc.presentation.TabListManager;
import fr.redlakes.mc.queue.Outbox;
import fr.redlakes.mc.queue.OutboxSender;
import fr.redlakes.mc.reports.ReportBookListener;
import fr.redlakes.mc.reports.ReportCommand;
import fr.redlakes.mc.reports.ReportMenu;
import fr.redlakes.mc.reports.ReportSubmitter;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;

/**
 * Couche d'exécution Minecraft du REDLAKES CORE. Le CORE décide, ce plugin
 * applique — voir §01 du cahier des charges. Ne pas ajouter ici de logique
 * métier (grades, permissions RP, etc.) qui doit rester côté CORE.
 *
 * Phase 1 (fondation) : connexion API, authentification serveur,
 * configuration, cache, heartbeat, gestion d'erreurs, synchronisation joueur.
 * Phase 2 (identité) : résolution User/Character/Faction/Département/
 * Équipe/Grade + détection des changements (GradeChanged/FactionChanged).
 * Phase 3 (présentation) : nametag/tablist (scoreboard team), chat, profil,
 * notifications de connexion/changement.
 */
public final class RedLakesPlugin extends JavaPlugin {

    private CoreConfig coreConfig;
    private CoreClient coreClient;
    private ConnectionManager connectionManager;
    private SessionCache sessionCache;
    private SessionSyncService sessionSyncService;
    private PresentationManager presentationManager;
    private TabListManager tabListManager;
    private PlayerConnectionListener playerConnectionListener;
    private Outbox outbox;
    private OutboxSender outboxSender;

    /** Au-delà, un nouveau rapport est refusé plutôt que d'accumuler sans fin pendant une longue panne. */
    private static final int OUTBOX_MAX_ENTRIES = 500;
    /** Passage de la file d'envoi : toutes les 60 s. */
    private static final long OUTBOX_FLUSH_TICKS = 60L * 20L;
    /** UUID qu'aucun compte ne portera jamais : un 404 prouve que le CORE répond et accepte la clé. */
    private static final String PROBE_UUID = "00000000-0000-0000-0000-000000000000";
    /** Vérification au démarrage : jusqu'à 6 essais espacés de 15 s (~1 min 30, le temps d'un réveil). */
    private static final int STARTUP_CHECK_ATTEMPTS = 6;
    private static final long STARTUP_CHECK_DELAY_TICKS = 15L * 20L;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        coreConfig = new CoreConfig(getConfig());

        if (!coreConfig.isSyncKeyConfigured()) {
            getLogger().warning("core.sync-key non configurée (ou valeur par défaut) dans config.yml — "
                    + "la synchronisation CORE échouera tant que ce n'est pas corrigé.");
        }

        connectionManager = new ConnectionManager();
        sessionCache = new SessionCache(coreConfig.getCacheTtlMinutes());
        coreClient = new CoreClient(coreConfig, getLogger());
        sessionSyncService = new SessionSyncService(coreClient, connectionManager, sessionCache, getLogger());
        presentationManager = new PresentationManager();
        tabListManager = new TabListManager(this, getLogger());

        playerConnectionListener = new PlayerConnectionListener(this);
        Bukkit.getPluginManager().registerEvents(playerConnectionListener, this);
        Bukkit.getPluginManager().registerEvents(new ChatFormatListener(this), this);
        getCommand("rl").setExecutor(new RlCommand(this));

        ChannelCommand channelCommand = new ChannelCommand(this);
        for (String channel : new String[] {"local", "faction", "department", "team", "ooc", "staffchat", "operation"}) {
            getCommand(channel).setExecutor(channelCommand);
        }
        getCommand("whisper").setExecutor(new WhisperCommand(this));

        outbox = new Outbox(new File(getDataFolder(), "outbox.json"), OUTBOX_MAX_ENTRIES);
        try {
            int pending = outbox.load();
            if (pending > 0) {
                getLogger().info(pending + " envoi(s) en attente repris de la session précédente.");
            }
        } catch (IOException e) {
            getLogger().log(Level.WARNING, "File d'envoi illisible — repart d'une file vide", e);
        }
        outboxSender = new OutboxSender(this, outbox, coreClient);
        Bukkit.getScheduler().runTaskTimerAsynchronously(this, outboxSender::flush, 200L, OUTBOX_FLUSH_TICKS);
        ReportSubmitter reportSubmitter = new ReportSubmitter(this);
        ReportMenu reportMenu = new ReportMenu(this);
        Bukkit.getPluginManager().registerEvents(reportMenu, this);
        Bukkit.getPluginManager().registerEvents(new ReportBookListener(this, reportSubmitter), this);
        ReportCommand reportCommand = new ReportCommand(this, reportSubmitter, reportMenu);
        getCommand("rapport").setExecutor(reportCommand);
        getCommand("rapport").setTabCompleter(reportCommand);

        long intervalTicks = coreConfig.getPollIntervalMinutes() * 60L * 20L;
        Bukkit.getScheduler().runTaskTimerAsynchronously(this, this::refreshOnlinePlayers, intervalTicks, intervalTicks);

        // Réveille le CORE dès le démarrage (l'hébergement gratuit s'endort
        // sans visite) pour qu'il soit prêt quand les joueurs arrivent.
        Bukkit.getScheduler().runTaskAsynchronously(this, () -> checkCore(STARTUP_CHECK_ATTEMPTS));

        getLogger().info("RedLakesPlugin actif — CORE " + coreConfig.getApiUrl()
                + " (serveur '" + coreConfig.getServerId() + "')");
    }

    private void checkCore(int attemptsLeft) {
        long start = System.currentTimeMillis();
        try {
            CoreClient.Response response = coreClient.get("/sync/minecraft/" + PROBE_UUID, 1);
            if (response.status == 404) {
                connectionManager.recordSuccess(System.currentTimeMillis() - start);
                getLogger().info("CORE joignable, clé de synchronisation acceptée.");
            } else if (response.status == 401) {
                getLogger().warning("Le CORE refuse la clé de synchronisation (401) — core.sync-key doit être "
                        + "identique à SYNC_API_KEY sur l'API.");
            } else if (response.status >= 500 && attemptsLeft > 1) {
                retryCoreCheck(attemptsLeft);
            } else {
                getLogger().warning("Vérification du CORE au démarrage : réponse " + response.status + ".");
            }
        } catch (CoreClient.CoreClientException e) {
            if (attemptsLeft > 1) {
                retryCoreCheck(attemptsLeft);
            } else {
                getLogger().warning("CORE toujours injoignable après ~1 min 30 — les joueurs seront "
                        + "synchronisés dès qu'il répond.");
            }
        }
    }

    private void retryCoreCheck(int attemptsLeft) {
        if (attemptsLeft == STARTUP_CHECK_ATTEMPTS) {
            getLogger().info("CORE pas encore joignable (réveil en cours ?) — nouvel essai toutes les 15 s.");
        }
        Bukkit.getScheduler().runTaskLaterAsynchronously(this, () -> checkCore(attemptsLeft - 1),
                STARTUP_CHECK_DELAY_TICKS);
    }

    private void refreshOnlinePlayers() {
        for (Player player : Bukkit.getOnlinePlayers()) {
            playerConnectionListener.syncPlayer(player);
        }
    }

    /**
     * Resynchronisation immédiate de tous les joueurs (/rl staff sync), hors
     * thread principal — utile au lancement ou à la clôture d'une opération
     * sans attendre le prochain poll.
     */
    public void refreshOnlinePlayersAsync() {
        Bukkit.getScheduler().runTaskAsynchronously(this, this::refreshOnlinePlayers);
    }

    /** Resynchronisation immédiate d'un seul joueur (/rl sync). */
    public void refreshPlayerAsync(Player player) {
        Bukkit.getScheduler().runTaskAsynchronously(this, () -> playerConnectionListener.syncPlayer(player));
    }

    public CoreConfig getCoreConfig() {
        return coreConfig;
    }

    public ConnectionManager getConnectionManager() {
        return connectionManager;
    }

    public SessionCache getSessionCache() {
        return sessionCache;
    }

    public SessionSyncService getSessionSyncService() {
        return sessionSyncService;
    }

    public PresentationManager getPresentationManager() {
        return presentationManager;
    }

    public Outbox getOutbox() {
        return outbox;
    }

    public OutboxSender getOutboxSender() {
        return outboxSender;
    }

    public TabListManager getTabListManager() {
        return tabListManager;
    }
}
