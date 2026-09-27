package fr.redlakes.mc.player;

/**
 * Résultat d'une synchronisation CORE. Distingue « le CORE dit que ce joueur
 * n'est pas lié » (on peut retirer son identité RP) d'« on n'a pas pu joindre
 * le CORE » (on ne touche à rien : une panne ne doit jamais effacer une
 * identité, cf. §07 mode dégradé).
 */
public final class SyncResult {

    public enum Status { OK, NOT_LINKED, FAILED }

    public final Status status;
    public final MinecraftSession session;

    private SyncResult(Status status, MinecraftSession session) {
        this.status = status;
        this.session = session;
    }

    public static SyncResult ok(MinecraftSession session) {
        return new SyncResult(Status.OK, session);
    }

    public static SyncResult notLinked() {
        return new SyncResult(Status.NOT_LINKED, null);
    }

    public static SyncResult failed() {
        return new SyncResult(Status.FAILED, null);
    }
}
