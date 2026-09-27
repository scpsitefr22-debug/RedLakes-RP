package fr.redlakes.mc.reports;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabExecutor;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * /rapport — dépose un rapport personnel dans le CORE depuis le jeu (§31).
 * Sans argument : ouvre le menu du formulaire papier (livre à remplir, pour
 * les rapports détaillés). Avec arguments : saisie rapide en une ligne,
 * /rapport &lt;type&gt; &lt;sujet&gt; | &lt;description&gt;. Dans les deux cas, le rapport
 * suit la même chaîne que sur le site ; sa visibilité reste décidée par l'API.
 */
public final class ReportCommand implements TabExecutor {

    private final RedLakesPlugin plugin;
    private final ReportSubmitter submitter;
    private final ReportMenu menu;

    public ReportCommand(RedLakesPlugin plugin, ReportSubmitter submitter, ReportMenu menu) {
        this.plugin = plugin;
        this.submitter = submitter;
        this.menu = menu;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }
        Player player = (Player) sender;

        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());
        if (session == null || !session.hasCharacter) {
            player.sendMessage(ChatColor.GRAY + "Aucun personnage CORE synchronisé : impossible de déposer un rapport.");
            return true;
        }

        if (args.length == 0) {
            menu.open(player, session);
            return true;
        }

        ReportRequest request = ReportRequest.parse(args);
        if (!request.isValid()) {
            player.sendMessage(ChatColor.RED + request.error);
            player.sendMessage(ChatColor.GRAY + "Astuce : /rapport sans rien ouvre le formulaire papier.");
            return true;
        }
        long wait = submitter.cooldownRemainingSeconds(player);
        if (wait > 0) {
            player.sendMessage(ChatColor.GRAY + "Patiente " + wait + " s avant un nouveau rapport.");
            return true;
        }
        submitter.submit(player, request);
        return true;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length != 1) {
            return Collections.emptyList();
        }
        List<String> matches = new ArrayList<>();
        for (String type : ReportRequest.SUGGESTED_TYPES) {
            if (type.startsWith(args[0].toLowerCase())) {
                matches.add(type);
            }
        }
        return matches;
    }
}
