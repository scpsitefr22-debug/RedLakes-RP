package fr.redlakes.mc.reports;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerEditBookEvent;
import org.bukkit.inventory.meta.BookMeta;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Transmission du formulaire papier : signer le livre = déposer le rapport.
 * Un formulaire incomplet n'est pas signé (le joueur garde son texte et
 * reçoit le motif) ; un formulaire valide devient une copie signée que le
 * joueur conserve dans son inventaire, comme un vrai document RP.
 */
public final class ReportBookListener implements Listener {

    private final RedLakesPlugin plugin;
    private final ReportSubmitter submitter;

    public ReportBookListener(RedLakesPlugin plugin, ReportSubmitter submitter) {
        this.plugin = plugin;
        this.submitter = submitter;
    }

    @EventHandler(priority = EventPriority.HIGH, ignoreCancelled = true)
    public void onEditBook(PlayerEditBookEvent event) {
        String type = ReportForm.typeFromLore(event.getPreviousBookMeta().getLore());
        if (type == null) {
            return; // livre ordinaire, pas un formulaire REDLAKES
        }
        if (!event.isSigning()) {
            // Simple sauvegarde du brouillon : on garantit que le livre reste
            // reconnu comme formulaire (nom + marqueur) pour la signature finale.
            BookMeta draft = event.getNewBookMeta();
            draft.setDisplayName(event.getPreviousBookMeta().getDisplayName());
            draft.setLore(event.getPreviousBookMeta().getLore());
            event.setNewBookMeta(draft);
            return;
        }

        Player player = event.getPlayer();
        BookMeta filled = event.getNewBookMeta();

        MinecraftSession session = plugin.getSessionCache().getStale(player.getUniqueId());
        if (session == null || !session.hasCharacter) {
            refuse(event, player, "Aucun personnage CORE synchronisé : le formulaire n'est pas transmis.");
            return;
        }

        ReportRequest request = ReportForm.read(type, filled.getPages());
        if (!request.isValid()) {
            refuse(event, player, request.error);
            return;
        }
        long wait = submitter.cooldownRemainingSeconds(player);
        if (wait > 0) {
            refuse(event, player, "Patiente " + wait + " s avant un nouveau rapport, puis signe à nouveau.");
            return;
        }

        // Copie signée conservée par le joueur : même texte, mention de transmission.
        List<String> lore = new ArrayList<>();
        lore.add(ChatColor.GRAY + request.subject);
        lore.add(ChatColor.DARK_GRAY + "Transmis au CORE le " + new SimpleDateFormat("dd/MM/yyyy HH:mm").format(new Date()));
        filled.setLore(lore);
        event.setNewBookMeta(filled);

        submitter.submit(player, request);
    }

    /** Le livre reste un formulaire modifiable, avec tout ce que le joueur a écrit. */
    private static void refuse(PlayerEditBookEvent event, Player player, String reason) {
        event.setSigning(false);
        BookMeta keep = event.getNewBookMeta();
        keep.setDisplayName(event.getPreviousBookMeta().getDisplayName());
        keep.setLore(event.getPreviousBookMeta().getLore());
        event.setNewBookMeta(keep);
        player.sendMessage(ChatColor.RED + "[CORE] " + ChatColor.WHITE + "Formulaire non transmis : " + reason);
        player.sendMessage(ChatColor.GRAY + "Ton texte est conservé : corrige-le puis signe à nouveau.");
    }
}
