package fr.redlakes.mc.player;

/**
 * Diff entre l'ancienne et la nouvelle session d'un joueur — §12-13 du
 * cahier des charges (GradeChanged / FactionChanged). Purement informatif :
 * dérivé de deux MinecraftSession déjà résolues côté CORE, n'invente rien.
 */
public final class SessionChange {

    public final boolean firstSync;
    public final boolean gradeChanged;
    public final boolean factionChanged;
    public final boolean departmentChanged;

    private SessionChange(boolean firstSync, boolean gradeChanged, boolean factionChanged, boolean departmentChanged) {
        this.firstSync = firstSync;
        this.gradeChanged = gradeChanged;
        this.factionChanged = factionChanged;
        this.departmentChanged = departmentChanged;
    }

    public boolean isRelevant() {
        return firstSync || gradeChanged || factionChanged || departmentChanged;
    }

    public static SessionChange compare(MinecraftSession previous, MinecraftSession current) {
        if (current == null || !current.hasCharacter) {
            return new SessionChange(false, false, false, false);
        }
        if (previous == null || !previous.hasCharacter) {
            return new SessionChange(true, false, false, false);
        }

        boolean grade = !idEquals(previous.grade != null ? previous.grade.id : null,
                current.grade != null ? current.grade.id : null);
        boolean faction = !idEquals(previous.faction != null ? previous.faction.id : null,
                current.faction != null ? current.faction.id : null);
        boolean department = !idEquals(previous.department != null ? previous.department.id : null,
                current.department != null ? current.department.id : null);

        return new SessionChange(false, grade, faction, department);
    }

    private static boolean idEquals(String a, String b) {
        return a == null ? b == null : a.equals(b);
    }
}
