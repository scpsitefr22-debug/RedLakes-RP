package fr.redlakes.mc;

import fr.redlakes.mc.chat.ChatFormatListener;
import fr.redlakes.mc.commands.RlCommand;
import fr.redlakes.mc.core.ConnectionManager;
import fr.redlakes.mc.core.CoreClient;
import fr.redlakes.mc.core.CoreConfig;
import fr.redlakes.mc.player.PlayerConnectionListener;
import fr.redlakes.mc.player.SessionCache;
import fr.redlakes.mc.player.SessionSyncService;
import fr.redlakes.mc.presentation.PresentationManager;
import fr.redlakes.mc.presentation.TabListManager;
import fr.redlakes.mc.zones.DoorListener;
import fr.redlakes.mc.zones.DoorRegistry;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

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
    private DoorRegistry doorRegistry;
    private PlayerConnectionListener playerConnectionListener;

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
        doorRegistry = new DoorRegistry(getDataFolder(), getLogger());

        playerConnectionListener = new PlayerConnectionListener(this);
        Bukkit.getPluginManager().registerEvents(playerConnectionListener, this);
        Bukkit.getPluginManager().registerEvents(new ChatFormatListener(this), this);
        Bukkit.getPluginManager().registerEvents(new DoorListener(this), this);
        getCommand("rl").setExecutor(new RlCommand(this));

        long intervalTicks = coreConfig.getPollIntervalMinutes() * 60L * 20L;
        Bukkit.getScheduler().runTaskTimerAsynchronously(this, this::refreshOnlinePlayers, intervalTicks, intervalTicks);

        getLogger().info("RedLakesPlugin actif — CORE " + coreConfig.getApiUrl()
                + " (serveur '" + coreConfig.getServerId() + "')");
    }

    private void refreshOnlinePlayers() {
        for (Player player : Bukkit.getOnlinePlayers()) {
            playerConnectionListener.syncPlayer(player);
        }
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

    public TabListManager getTabListManager() {
        return tabListManager;
    }

    public DoorRegistry getDoorRegistry() {
        return doorRegistry;
    }
}
