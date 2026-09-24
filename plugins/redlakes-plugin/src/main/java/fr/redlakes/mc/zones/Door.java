package fr.redlakes.mc.zones;

/**
 * Porte enregistrée — §24 du cahier des charges. Purement une règle
 * d'accès (clearance + département), jamais une donnée RP en dur : le
 * département requis est un slug résolu côté CORE, pas un nom de faction.
 */
public final class Door {

    public final String world;
    public final int x;
    public final int y;
    public final int z;
    public final int requiredClearance;
    public final String requiredDepartmentSlug; // nullable

    public Door(String world, int x, int y, int z, int requiredClearance, String requiredDepartmentSlug) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.z = z;
        this.requiredClearance = requiredClearance;
        this.requiredDepartmentSlug = requiredDepartmentSlug;
    }

    public String key() {
        return key(world, x, y, z);
    }

    public static String key(String world, int x, int y, int z) {
        return world + "," + x + "," + y + "," + z;
    }
}
