package fr.redlakes.mc.commands;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.zones.Door;
import org.bukkit.ChatColor;
import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.Collections;

/**
 * /rl staff door add|remove|list — commande technique staff, séparée des
 * commandes RP (§51). Toute la logique d'accès vit dans zones/, ce fichier
 * ne fait que traduire les arguments de commande.
 */
public final class DoorCommand {

    private static final String USAGE = "Usage: /rl staff door <add <clearance> [departement]|remove|list>";

    private final RedLakesPlugin plugin;

    public DoorCommand(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    public boolean handle(CommandSender sender, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }
        Player player = (Player) sender;

        if (args.length == 0) {
            sender.sendMessage(ChatColor.GRAY + USAGE);
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "add":
                return handleAdd(player, args);
            case "remove":
                return handleRemove(player);
            case "list":
                return handleList(sender);
            default:
                sender.sendMessage(ChatColor.GRAY + USAGE);
                return true;
        }
    }

    private boolean handleAdd(Player player, String[] args) {
        if (args.length < 2) {
            player.sendMessage(ChatColor.GRAY + USAGE);
            return true;
        }
        int clearance;
        try {
            clearance = Integer.parseInt(args[1]);
        } catch (NumberFormatException e) {
            player.sendMessage(ChatColor.RED + "Clearance invalide : " + args[1]);
            return true;
        }
        String department = args.length >= 3 ? args[2].toLowerCase() : null;

        Block target = player.getTargetBlock(Collections.singleton(Material.AIR), 6);
        if (target == null || target.getType() == Material.AIR) {
            player.sendMessage(ChatColor.RED + "Regarde le bloc de la porte à moins de 6 blocs.");
            return true;
        }

        Door door = new Door(target.getWorld().getName(), target.getX(), target.getY(), target.getZ(), clearance, department);
        plugin.getDoorRegistry().add(door);

        player.sendMessage(ChatColor.GREEN + "Porte enregistrée — clearance " + clearance
                + (department != null ? ", département " + department : ""));
        return true;
    }

    private boolean handleRemove(Player player) {
        Block target = player.getTargetBlock(Collections.singleton(Material.AIR), 6);
        if (target == null || target.getType() == Material.AIR) {
            player.sendMessage(ChatColor.RED + "Regarde le bloc de la porte à moins de 6 blocs.");
            return true;
        }
        Door removed = plugin.getDoorRegistry().remove(target.getWorld().getName(), target.getX(), target.getY(), target.getZ());
        player.sendMessage(removed != null
                ? ChatColor.GREEN + "Porte retirée."
                : ChatColor.GRAY + "Aucune porte enregistrée ici.");
        return true;
    }

    private boolean handleList(CommandSender sender) {
        java.util.Collection<Door> doors = plugin.getDoorRegistry().all();
        if (doors.isEmpty()) {
            sender.sendMessage(ChatColor.GRAY + "Aucune porte enregistrée.");
            return true;
        }
        sender.sendMessage(ChatColor.GOLD + "=== Portes enregistrées (" + doors.size() + ") ===");
        for (Door door : doors) {
            String dept = door.requiredDepartmentSlug != null ? ", " + door.requiredDepartmentSlug : "";
            sender.sendMessage(ChatColor.GRAY + "- " + door.world + " (" + door.x + "," + door.y + "," + door.z + ")"
                    + " — clearance " + door.requiredClearance + dept);
        }
        return true;
    }
}
