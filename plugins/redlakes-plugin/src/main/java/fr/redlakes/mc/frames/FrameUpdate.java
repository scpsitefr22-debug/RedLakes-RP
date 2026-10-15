package fr.redlakes.mc.frames;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Un cadre photo (MrCrayfish Furniture) à re-pointer : position et nouveau
 * lien d'image. Java pur, sans Bukkit — la lecture du fichier se teste
 * directement.
 */
public final class FrameUpdate {

    public final int x;
    public final int y;
    public final int z;
    public final String url;

    FrameUpdate(int x, int y, int z, String url) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.url = url;
    }

    /** Commande vanilla qui remplace le lien stocké par le cadre (clé NBT « Photo »). */
    public String toBlockdataCommand() {
        return "blockdata " + x + " " + y + " " + z + " {Photo:\"" + url + "\"}";
    }

    /** Résultat de lecture : les cadres valides, ou les lignes refusées (fichier alors ignoré en entier). */
    public static final class ParseResult {
        public final List<FrameUpdate> updates;
        public final List<String> errors;

        ParseResult(List<FrameUpdate> updates, List<String> errors) {
            this.updates = Collections.unmodifiableList(updates);
            this.errors = Collections.unmodifiableList(errors);
        }
    }

    /**
     * Une ligne par cadre : {@code x y z lien}. Lignes vides et commentaires
     * ({@code #}) ignorés. Le lien est injecté tel quel dans une chaîne NBT :
     * guillemets, antislash et espaces y sont donc refusés.
     */
    public static ParseResult parse(List<String> lines) {
        List<FrameUpdate> updates = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i).trim();
            if (line.isEmpty() || line.startsWith("#")) {
                continue;
            }
            String[] parts = line.split("\\s+");
            if (parts.length != 4) {
                errors.add("ligne " + (i + 1) + " : attendu « x y z lien »");
                continue;
            }
            String url = parts[3];
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                errors.add("ligne " + (i + 1) + " : le lien doit commencer par http:// ou https://");
                continue;
            }
            if (url.contains("\"") || url.contains("\\")) {
                errors.add("ligne " + (i + 1) + " : guillemet ou antislash interdit dans le lien");
                continue;
            }
            try {
                updates.add(new FrameUpdate(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]),
                        Integer.parseInt(parts[2]), url));
            } catch (NumberFormatException e) {
                errors.add("ligne " + (i + 1) + " : coordonnées invalides");
            }
        }
        return new ParseResult(updates, errors);
    }
}
