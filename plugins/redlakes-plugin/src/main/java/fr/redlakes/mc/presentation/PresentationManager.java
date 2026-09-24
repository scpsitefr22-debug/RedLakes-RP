package fr.redlakes.mc.presentation;

import fr.redlakes.mc.player.MinecraftSession;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.scoreboard.Scoreboard;
import org.bukkit.scoreboard.Team;

/**
 * Nametag + tag de tablist à partir de la session CORE — §19-20 du cahier
 * des charges. Utilise le scoreboard principal (partagé, visible par tous),
 * jamais un scoreboard par joueur (réservé à d'autres plugins comme Quests).
 *
 * Règle : aucune donnée de présentation n'est inventée ici. Tout vient de
 * MinecraftSession (grade/faction/département déjà résolus côté CORE) et de
 * TagLabel (texte partagé avec ChatFormatListener) — ce fichier ne fait que
 * dériver une couleur à partir du clearanceLevel et gérer la Team Bukkit.
 * Le masquage d'identité (ex: faction civile) est décidé côté CORE via
 * Faction.showAffiliationTag, jamais par un nom de faction en dur ici.
 */
public final class PresentationManager {

    private static final String TEAM_PREFIX = "rl_";

    private final Scoreboard board;

    public PresentationManager() {
        this.board = Bukkit.getScoreboardManager().getMainScoreboard();
    }

    public void applyToPlayer(Player player, MinecraftSession session) {
        removePlayer(player);

        if (session == null || !session.hasCharacter) {
            return;
        }

        String label = TagLabel.shortLabel(session);
        if (label.isEmpty()) {
            return;
        }

        ChatColor color = colorForClearance(session.grade.clearanceLevel);
        // grade.id peut être null (grade texte libre sans correspondance catalogue
        // côté CORE) — se rabattre sur le nom du grade pour rester stable et non-null.
        String gradeKey = session.grade.id != null ? session.grade.id : session.grade.name;
        String teamName = TEAM_PREFIX + Integer.toHexString(gradeKey.hashCode());
        Team team = board.getTeam(teamName);
        if (team == null) {
            team = board.registerNewTeam(teamName);
        }
        team.setPrefix(color + "[" + label + "] " + ChatColor.RESET);
        team.setColor(color);
        if (!team.hasEntry(player.getName())) {
            team.addEntry(player.getName());
        }
    }

    public void removePlayer(Player player) {
        Team current = board.getEntryTeam(player.getName());
        if (current != null && current.getName().startsWith(TEAM_PREFIX)) {
            current.removeEntry(player.getName());
        }
    }

    private ChatColor colorForClearance(int clearanceLevel) {
        switch (clearanceLevel) {
            case 5: return ChatColor.GOLD;
            case 4: return ChatColor.RED;
            case 3: return ChatColor.YELLOW;
            case 2: return ChatColor.AQUA;
            default: return ChatColor.GRAY;
        }
    }
}
