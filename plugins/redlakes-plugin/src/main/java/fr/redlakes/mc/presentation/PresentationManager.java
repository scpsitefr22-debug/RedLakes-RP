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
 * MinecraftSession (grade/faction/département déjà résolus côté CORE) — ce
 * fichier ne fait que dériver un texte court (limite historique 16
 * caractères des Team 1.12.2) et une couleur à partir du clearanceLevel.
 * Un civil (faction "civil") n'a aucun préfixe — identité civile masquée.
 */
public final class PresentationManager {

    private static final String TEAM_PREFIX = "rl_";

    private final Scoreboard board;

    public PresentationManager() {
        this.board = Bukkit.getScoreboardManager().getMainScoreboard();
    }

    public void applyToPlayer(Player player, MinecraftSession session) {
        removePlayer(player);

        if (session == null || !session.hasCharacter || !showsTag(session)) {
            return;
        }

        String label = shortLabel(session);
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

    /**
     * Décidé côté CORE (Faction.showAffiliationTag), jamais par un nom de
     * faction en dur ici — cf. §65 : pas de données RP figées dans le jar.
     */
    private boolean showsTag(MinecraftSession session) {
        return session.faction != null && session.faction.showAffiliationTag;
    }

    /** Département si connu, sinon faction — tronqué pour tenir dans un préfixe de team. */
    private String shortLabel(MinecraftSession session) {
        String source = session.department != null && session.department.name != null
                ? session.department.name
                : (session.faction != null ? session.faction.name : null);
        if (source == null || source.trim().isEmpty()) {
            return "";
        }
        String firstWord = source.trim().split("\\s+")[0];
        String upper = firstWord.toUpperCase();
        return upper.length() > 4 ? upper.substring(0, 4) : upper;
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
