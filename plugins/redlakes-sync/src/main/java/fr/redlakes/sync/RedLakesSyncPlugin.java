package fr.redlakes.sync;

import com.google.gson.Gson;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;

/**
 * Plugin Paper minimal — pousse le grade LuckPerms (ou permission redlakes.grade.*)
 * vers POST /api/sync/role sur le site REDLAKES.
 *
 * config.yml :
 *   api-url: "http://localhost:3001/api"
 *   sync-key: "votre-SYNC_API_KEY"
 *   grade-permission-prefix: "redlakes.grade."
 */
public final class RedLakesSyncPlugin extends JavaPlugin implements Listener {

    private final Gson gson = new Gson();
    private HttpClient httpClient;
    private String apiUrl;
    private String syncKey;
    private String gradePrefix;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        apiUrl = getConfig().getString("api-url", "http://localhost:3001/api");
        syncKey = getConfig().getString("sync-key", "");
        gradePrefix = getConfig().getString("grade-permission-prefix", "redlakes.grade.");

        httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        Bukkit.getPluginManager().registerEvents(this, this);
        getLogger().info("RedLakesSync actif — API " + apiUrl);
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        Bukkit.getScheduler().runTaskLaterAsynchronously(this, () -> syncPlayer(event.getPlayer()), 40L);
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }
        if (!player.hasPermission("redlakes.sync.self")) {
            player.sendMessage("§cPermission refusée.");
            return true;
        }
        Bukkit.getScheduler().runTaskAsynchronously(this, () -> syncPlayer(player));
        player.sendMessage("§7Synchronisation Site-12 en cours…");
        return true;
    }

    void syncPlayer(Player player) {
        if (syncKey == null || syncKey.isBlank()) {
            getLogger().warning("sync-key non configurée — sync ignorée pour " + player.getName());
            return;
        }

        String grade = resolveGrade(player);
        String faction = resolveFaction(player);

        Map<String, Object> body = new HashMap<>();
        body.put("minecraftUsername", player.getName());
        body.put("minecraftUuid", player.getUniqueId().toString());
        body.put("grade", grade);
        body.put("faction", faction);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl + "/sync/role"))
                    .timeout(Duration.ofSeconds(8))
                    .header("Content-Type", "application/json")
                    .header("X-Redlakes-Sync-Key", syncKey)
                    .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                getLogger().info("Sync OK — " + player.getName() + " → " + grade);
            } else {
                getLogger().log(Level.WARNING, "Sync échouée (" + response.statusCode() + ") : " + response.body());
            }
        } catch (Exception e) {
            getLogger().log(Level.WARNING, "Sync API injoignable pour " + player.getName(), e);
        }
    }

    private String resolveGrade(Player player) {
        for (var perm : player.getEffectivePermissions()) {
            String node = perm.getPermission();
            if (node.startsWith(gradePrefix) && perm.getValue()) {
                return node.substring(gradePrefix.length()).replace('.', ' ');
            }
        }
        return "Civil";
    }

    private String resolveFaction(Player player) {
        for (var perm : player.getEffectivePermissions()) {
            String node = perm.getPermission();
            if (node.startsWith("redlakes.faction.") && perm.getValue()) {
                return node.substring("redlakes.faction.".length()).replace('.', ' ');
            }
        }
        return "Civil";
    }
}
