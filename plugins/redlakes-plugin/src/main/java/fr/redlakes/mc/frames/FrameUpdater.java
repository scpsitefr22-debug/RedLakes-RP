package fr.redlakes.mc.frames;

import fr.redlakes.mc.RedLakesPlugin;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.command.CommandSender;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.List;

/**
 * Re-pointe des cadres photo MrCrayfish Furniture : charge le chunk, vérifie
 * qu'un cadre est toujours là, puis remplace son lien par la commande vanilla
 * /blockdata. Thread principal, quelques cadres par tick pour ne pas figer le
 * serveur (les cadres sont répartis sur toute la carte, chaque chunk se charge).
 */
public final class FrameUpdater {

    /** Nom Mohist du bloc forge cfm:photo_frame. */
    private static final String PHOTO_FRAME = "CFM_PHOTO_FRAME";
    private static final int FRAMES_PER_TICK = 5;

    private final RedLakesPlugin plugin;

    public FrameUpdater(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    public void apply(CommandSender sender, World world, List<FrameUpdate> updates) {
        new BukkitRunnable() {
            private int index;
            private int updated;
            private int missing;

            @Override
            public void run() {
                for (int n = 0; n < FRAMES_PER_TICK && index < updates.size(); n++, index++) {
                    FrameUpdate update = updates.get(index);
                    world.getChunkAt(update.x >> 4, update.z >> 4).load();
                    Block block = world.getBlockAt(update.x, update.y, update.z);
                    if (!PHOTO_FRAME.equals(block.getType().name())) {
                        missing++;
                        continue;
                    }
                    Bukkit.dispatchCommand(Bukkit.getConsoleSender(), update.toBlockdataCommand());
                    updated++;
                }
                if (index >= updates.size()) {
                    cancel();
                    sender.sendMessage(ChatColor.GREEN + "" + updated + " cadre(s) photo mis à jour."
                            + (missing > 0 ? ChatColor.YELLOW + " " + missing
                            + " ignoré(s) : plus de cadre photo à cet endroit." : ""));
                }
            }
        }.runTaskTimer(plugin, 1L, 1L);
    }
}
