package fr.redlakes.mc.reports;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Material;
import org.bukkit.entity.HumanEntity;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.inventory.InventoryDragEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.InventoryHolder;
import org.bukkit.inventory.ItemFlag;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.BookMeta;
import org.bukkit.inventory.meta.ItemMeta;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Menu « Nouveau rapport » : un coffre de 9 cases avec les 4 types, nommés
 * avec le vocabulaire de la faction du joueur (servi par le CORE). Un clic
 * remet un formulaire papier (livre et plume) pré-rempli à compléter.
 * Aucune donnée RP n'est stockée ici ; le menu ne fait que distribuer le livre.
 */
public final class ReportMenu implements Listener {

    private static final String TITLE = "Nouveau rapport";

    /** Case du coffre → type CORE. */
    private static final Map<Integer, String> SLOTS = new HashMap<>();
    private static final Map<String, Material> ICONS = new HashMap<>();

    static {
        SLOTS.put(1, "INCIDENT");
        SLOTS.put(3, "AUTHORIZATION");
        SLOTS.put(5, "MEMO");
        SLOTS.put(7, "EQUIPMENT");
        ICONS.put("INCIDENT", Material.REDSTONE_TORCH_ON);
        ICONS.put("AUTHORIZATION", Material.NAME_TAG);
        ICONS.put("MEMO", Material.PAPER);
        ICONS.put("EQUIPMENT", Material.IRON_CHESTPLATE);
    }

    /** Marqueur d'inventaire : distingue notre menu de tout autre coffre du même titre. */
    private static final class Holder implements InventoryHolder {
        private final Map<String, String> labels;
        private Inventory inventory;

        Holder(Map<String, String> labels) {
            this.labels = labels;
        }

        @Override
        public Inventory getInventory() {
            return inventory;
        }
    }

    private final RedLakesPlugin plugin;

    public ReportMenu(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    public void open(Player player, MinecraftSession session) {
        Map<String, String> labels = session.faction != null ? session.faction.reportLabels : null;
        Holder holder = new Holder(labels);
        Inventory inventory = Bukkit.createInventory(holder, 9, TITLE);
        holder.inventory = inventory;
        for (Map.Entry<Integer, String> slot : SLOTS.entrySet()) {
            String type = slot.getValue();
            ItemStack icon = new ItemStack(ICONS.get(type));
            ItemMeta meta = icon.getItemMeta();
            meta.setDisplayName(ChatColor.WHITE + ReportForm.labelFor(labels, type));
            meta.setLore(Arrays.asList(ChatColor.GRAY + "Clique pour recevoir le formulaire.",
                    ChatColor.DARK_GRAY + "Remplis-le, puis signe-le pour le transmettre."));
            meta.addItemFlags(ItemFlag.HIDE_ATTRIBUTES);
            icon.setItemMeta(meta);
            inventory.setItem(slot.getKey(), icon);
        }
        player.openInventory(inventory);
    }

    @EventHandler
    public void onClick(InventoryClickEvent event) {
        if (!(event.getInventory().getHolder() instanceof Holder)) {
            return;
        }
        // Rien ne sort ni n'entre dans ce menu, quelle que soit la case cliquée.
        event.setCancelled(true);
        if (event.getRawSlot() >= event.getInventory().getSize()) {
            return;
        }
        String type = SLOTS.get(event.getRawSlot());
        HumanEntity who = event.getWhoClicked();
        if (type == null || !(who instanceof Player)) {
            return;
        }
        Player player = (Player) who;
        Holder holder = (Holder) event.getInventory().getHolder();
        // Fermeture différée d'un tick : fermer pendant l'événement de clic est déconseillé par Bukkit.
        Bukkit.getScheduler().runTask(plugin, () -> {
            player.closeInventory();
            giveForm(player, type, ReportForm.labelFor(holder.labels, type));
        });
    }

    @EventHandler
    public void onDrag(InventoryDragEvent event) {
        if (event.getInventory().getHolder() instanceof Holder) {
            event.setCancelled(true);
        }
    }

    private void giveForm(Player player, String type, String label) {
        ItemStack book = new ItemStack(Material.BOOK_AND_QUILL);
        BookMeta meta = (BookMeta) book.getItemMeta();
        meta.setDisplayName(ChatColor.WHITE + "Formulaire — " + label);
        meta.setLore(Arrays.asList(
                ChatColor.GRAY + "Remplis le sujet et la description,",
                ChatColor.GRAY + "puis signe le livre pour le transmettre.",
                ChatColor.BLACK + ReportForm.loreTag(type)));
        meta.setPages(ReportForm.templatePages(label));
        book.setItemMeta(meta);

        if (!player.getInventory().addItem(book).isEmpty()) {
            player.sendMessage(ChatColor.RED + "Inventaire plein : libère une place pour recevoir le formulaire.");
            return;
        }
        player.sendMessage(ChatColor.GOLD + "[REDLAKES] " + ChatColor.WHITE + "Formulaire reçu : " + label
                + ChatColor.GRAY + " — ouvre-le, remplis-le, puis signe-le.");
    }
}
