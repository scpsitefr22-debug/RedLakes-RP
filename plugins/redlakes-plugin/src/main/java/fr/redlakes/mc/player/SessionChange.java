package fr.redlakes.mc.player;

/**
 * Diff entre l'ancienne et la nouvelle session d'un joueur — §12-13 du
 * cahier des charges (GradeChanged / FactionChanged / CharacterChanged...)
 * et §33-34 (début / fin d'affectation d'opération). Purement informatif :
 * dérivé de deux MinecraftSession déjà résolues côté CORE, n'invente rien.
 * Comparaison par identifiants CORE, jamais par nom.
 */
public final class SessionChange {

    public final boolean firstSync;
    /** Le joueur incarne un autre personnage du même compte (§10). */
    public final boolean characterChanged;
    /** Le compte n'a plus de personnage actif, ou n'est plus lié au CORE. */
    public final boolean characterLost;
    public final boolean gradeChanged;
    public final boolean factionChanged;
    public final boolean departmentChanged;
    public final boolean teamChanged;
    /** Une nouvelle affectation d'opération est active (y compris à la connexion pendant une opération). */
    public final boolean eventAssigned;
    /** L'affectation d'opération précédente est levée (clôture ou retrait) et aucune ne la remplace. */
    public final boolean eventEnded;

    private SessionChange(boolean firstSync, boolean characterChanged, boolean characterLost,
                          boolean gradeChanged, boolean factionChanged,
                          boolean departmentChanged, boolean teamChanged,
                          boolean eventAssigned, boolean eventEnded) {
        this.firstSync = firstSync;
        this.characterChanged = characterChanged;
        this.characterLost = characterLost;
        this.gradeChanged = gradeChanged;
        this.factionChanged = factionChanged;
        this.departmentChanged = departmentChanged;
        this.teamChanged = teamChanged;
        this.eventAssigned = eventAssigned;
        this.eventEnded = eventEnded;
    }

    private static final SessionChange NONE =
            new SessionChange(false, false, false, false, false, false, false, false, false);

    public boolean isRelevant() {
        return firstSync || characterChanged || characterLost
                || gradeChanged || factionChanged || departmentChanged || teamChanged
                || eventAssigned || eventEnded;
    }

    /**
     * {@code current} null = le CORE a confirmé que l'UUID n'est pas lié
     * (404). Ne jamais appeler avec null sur une panne réseau : une panne
     * n'est pas une perte d'identité (voir SyncResult).
     */
    public static SessionChange compare(MinecraftSession previous, MinecraftSession current) {
        boolean hadCharacter = previous != null && previous.hasCharacter;

        if (current == null || !current.hasCharacter) {
            return hadCharacter
                    ? new SessionChange(false, false, true, false, false, false, false, false, false)
                    : NONE;
        }
        if (!hadCharacter) {
            return new SessionChange(true, false, false, false, false, false, false,
                    current.eventAssignment != null, false);
        }

        boolean character = !idEquals(previous.characterId, current.characterId);
        boolean grade = !idEquals(previous.grade != null ? previous.grade.id : null,
                current.grade != null ? current.grade.id : null);
        boolean faction = !idEquals(previous.faction != null ? previous.faction.id : null,
                current.faction != null ? current.faction.id : null);
        boolean department = !idEquals(previous.department != null ? previous.department.id : null,
                current.department != null ? current.department.id : null);
        boolean team = !idEquals(previous.team != null ? previous.team.id : null,
                current.team != null ? current.team.id : null);

        // Par identifiant d'affectation : retirer puis réaffecter quelqu'un à
        // un autre poste produit un nouvel id, donc une nouvelle carte.
        String previousAssignment = previous.eventAssignment != null ? previous.eventAssignment.id : null;
        String currentAssignment = current.eventAssignment != null ? current.eventAssignment.id : null;
        boolean assigned = currentAssignment != null && !currentAssignment.equals(previousAssignment);
        boolean ended = previousAssignment != null && currentAssignment == null;

        return new SessionChange(false, character, false, grade, faction, department, team, assigned, ended);
    }

    private static boolean idEquals(String a, String b) {
        return a == null ? b == null : a.equals(b);
    }
}
