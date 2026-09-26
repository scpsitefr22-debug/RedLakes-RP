package fr.redlakes.mc.chat;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.Arrays;

/** /whisper <joueur> <message> (§18) — canal privé, cible par joueur en ligne. */
public final class WhisperCommand implements CommandExecutor {

    private final RedLakesPlugin plugin;

    public WhisperCommand(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }
        if (args.length < 2) {
            sender.sendMessage(ChatColor.GRAY + "Usage: /whisper <joueur> <message>");
            return true;
        }

        Player player = (Player) sender;
        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());
        if (session == null || !session.hasCharacter) {
            player.sendMessage(ChatColor.GRAY + "Aucun profil CORE synchronisé pour le moment.");
            return true;
        }

        Player target = Bukkit.getPlayerExact(args[0]);
        if (target == null || !target.isOnline()) {
            player.sendMessage(ChatColor.RED + "Joueur introuvable ou hors ligne.");
            return true;
        }
        if (target.equals(player)) {
            player.sendMessage(ChatColor.RED + "Tu ne peux pas te chuchoter à toi-même.");
            return true;
        }

        String message = String.join(" ", Arrays.copyOfRange(args, 1, args.length));
        String senderName = ChatIdentity.rpName(session, player.getName());

        player.sendMessage(ChatColor.DARK_GRAY + "(À " + target.getName() + ") " + ChatColor.GRAY + message);
        target.sendMessage(ChatColor.DARK_GRAY + "(De " + senderName + ") " + ChatColor.GRAY + message);
        return true;
    }
}
