package fr.redlakes.mc.player;

import fr.redlakes.mc.RedLakesPlugin;
import fr.redlakes.mc.chat.OperationCard;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

public final class PlayerConnectionListener implements Listener {

    private final RedLakesPlugin plugin;

    public PlayerConnectionListener(RedLakesPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        // Léger délai pour laisser la connexion se stabiliser avant le premier appel réseau.
        Bukkit.getScheduler().runTaskLaterAsynchronously(plugin, () -> syncPlayer(player), 40L);
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        plugin.getSessionCache().remove(player.getUniqueId());
        plugin.getPresentationManager().removePlayer(player);
    }

    /**
     * Appelé à la connexion et par le rafraîchissement périodique. Compare
     * l'ancienne et la nouvelle session (§12-13) — ne notifie le joueur que
     * lors de la première sync ou d'un vrai changement, jamais à chaque poll
     * silencieux. Une panne CORE (FAILED) ne modifie jamais l'identité
     * affichée : seul un refus explicite du CORE (404, plus de personnage
     * actif) la retire.
     */
    public void syncPlayer(Player player) {
        MinecraftSession previous = plugin.getSessionCache().getStale(player.getUniqueId());
        SyncResult result = plugin.getSessionSyncService().fetch(player.getUniqueId(), player.getName());

        if (result.status == SyncResult.Status.FAILED) {
            return;
        }

        MinecraftSession session = result.session;
        SessionChange change = SessionChange.compare(previous, session);

        if (result.status == SyncResult.Status.NOT_LINKED && !change.characterLost) {
            plugin.getLogger().info(player.getName() + " — pas encore de compte CORE lié à cet UUID.");
        } else if (session != null && !session.hasCharacter && !change.characterLost) {
            plugin.getLogger().info(player.getName() + " — compte CORE lié, aucun personnage actif.");
        }
        logChanges(player, previous, session, change);

        if (!change.isRelevant()) {
            return;
        }

        // Team/nametag = API Bukkit, doit s'exécuter sur le thread principal.
        Bukkit.getScheduler().runTask(plugin, () -> {
            if (!player.isOnline()) {
                return;
            }
            // applyToPlayer retire toujours l'ancien tag d'abord : un changement
            // de personnage ne laisse rien du personnage précédent (§10).
            plugin.getPresentationManager().applyToPlayer(player, session);
            plugin.getTabListManager().applyToPlayer(player, session);
            notifyPlayer(player, session, change);
        });
    }

    private void logChanges(Player player, MinecraftSession previous, MinecraftSession session, SessionChange change) {
        String name = player.getName();
        if (change.characterLost) {
            plugin.getLogger().info(name + " — CharacterLost: plus de personnage actif côté CORE.");
            return;
        }
        if (change.characterChanged) {
            plugin.getLogger().info(name + " — CharacterChanged: " + rpName(previous) + " -> " + rpName(session));
        } else {
            logIdentityChanges(name, previous, session, change);
        }
        if (change.eventAssigned) {
            plugin.getLogger().info(name + " — EventAssigned: " + session.eventAssignment.eventTitle
                    + " / " + session.eventAssignment.roleLabel);
        }
        if (change.eventEnded) {
            plugin.getLogger().info(name + " — EventEnded: " + previous.eventAssignment.eventTitle);
        }
    }

    private void logIdentityChanges(String name, MinecraftSession previous, MinecraftSession session, SessionChange change) {
        if (change.gradeChanged) {
            plugin.getLogger().info(name + " — GradeChanged: "
                    + (previous.grade != null ? previous.grade.name : "?") + " -> " + session.grade.name);
        }
        if (change.factionChanged) {
            plugin.getLogger().info(name + " — FactionChanged: "
                    + (previous.faction != null ? previous.faction.name : "?") + " -> " + session.faction.name);
        }
        if (change.departmentChanged) {
            plugin.getLogger().info(name + " — DepartmentChanged: " + departmentName(previous) + " -> " + departmentName(session));
        }
        if (change.teamChanged) {
            plugin.getLogger().info(name + " — TeamChanged: " + teamName(previous) + " -> " + teamName(session));
        }
    }

    private void notifyPlayer(Player player, MinecraftSession session, SessionChange change) {
        String prefix = ChatColor.GOLD + "[REDLAKES] " + ChatColor.WHITE;
        if (change.characterLost) {
            player.sendMessage(prefix + "Aucun personnage actif n'est associé à ton compte pour le moment.");
            return;
        }
        if (change.firstSync || change.characterChanged) {
            if (change.characterChanged) {
                player.sendMessage(prefix + "Personnage actif : " + ChatColor.YELLOW + rpName(session));
            }
            player.sendMessage(prefix + session.grade.name + ChatColor.GRAY + " — " + ChatColor.WHITE + session.faction.name);
        } else {
            if (change.gradeChanged) {
                player.sendMessage(prefix + "Votre grade a été mis à jour : " + ChatColor.YELLOW + session.grade.name);
            }
            if (change.factionChanged) {
                player.sendMessage(prefix + "Votre faction a été mise à jour : " + ChatColor.YELLOW + session.faction.name);
            }
            if (change.departmentChanged) {
                player.sendMessage(prefix + "Votre département a été mis à jour : " + ChatColor.YELLOW + departmentName(session));
            }
            if (change.teamChanged) {
                player.sendMessage(prefix + "Votre équipe a été mise à jour : " + ChatColor.YELLOW + teamName(session));
            }
        }

        // Opération : la carte d'affectation passe après l'identité permanente,
        // qui reste inchangée pendant toute l'opération.
        if (change.eventAssigned && session.eventAssignment != null) {
            OperationCard.send(player, session.eventAssignment);
        } else if (change.eventEnded) {
            player.sendMessage(ChatColor.DARK_RED + "[OPÉRATION] " + ChatColor.WHITE
                    + "Affectation levée. Reprenez votre poste habituel.");
        }
    }

    private static String rpName(MinecraftSession session) {
        if (session == null) {
            return "?";
        }
        String full = ((session.rpFirstName != null ? session.rpFirstName : "") + " "
                + (session.rpLastName != null ? session.rpLastName : "")).trim();
        return full.isEmpty() ? "personnage sans nom" : full;
    }

    private static String departmentName(MinecraftSession session) {
        return session != null && session.department != null ? session.department.name : "aucun";
    }

    private static String teamName(MinecraftSession session) {
        return session != null && session.team != null ? session.team.name : "aucune";
    }
}
