package fr.redlakes.mc.zones;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.ChatColor;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.player.PlayerInteractEvent;

/**
 * §24 : une porte enregistrée demande CanCharacterAccess(character, door)
 * avant de laisser l'interaction vanilla se produire. Ne fait aucun appel
 * réseau ici — lit uniquement le cache déjà rempli par SessionSyncService.
 */
public final class DoorListener implements Listener {

    private final RedLakesPlugin plugin;

    public DoorListener(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onInteract(PlayerInteractEvent event) {
        if (event.getAction() != Action.RIGHT_CLICK_BLOCK) {
            return;
        }
        Block block = event.getClickedBlock();
        if (block == null) {
            return;
        }

        Door door = plugin.getDoorRegistry().find(block.getLocation());
        if (door == null) {
            return;
        }

        Player player = event.getPlayer();
        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());

        if (DoorAccessResolver.canAccess(session, door)) {
            return;
        }

        event.setCancelled(true);
        player.sendMessage(ChatColor.RED + "Accès refusé — clearance ou département insuffisant.");
    }
}
