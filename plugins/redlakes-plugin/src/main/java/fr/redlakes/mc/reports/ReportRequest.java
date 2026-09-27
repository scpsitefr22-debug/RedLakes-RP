package fr.redlakes.mc.reports;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Analyse de /rapport &lt;type&gt; &lt;sujet&gt; | &lt;description&gt; (§31). Java pur.
 * Les bornes reprennent exactement CreatePersonnelReportDto côté CORE,
 * pour refuser en jeu ce que l'API refuserait de toute façon.
 */
public final class ReportRequest {

    public static final int SUBJECT_MIN = 3;
    public static final int SUBJECT_MAX = 120;
    public static final int CONTENT_MIN = 10;
    public static final int CONTENT_MAX = 4000;

    /** Mot tapé en jeu → valeur PersonnelReportType du CORE. */
    private static final Map<String, String> TYPES = new LinkedHashMap<>();

    static {
        TYPES.put("incident", "INCIDENT");
        TYPES.put("autorisation", "AUTHORIZATION");
        TYPES.put("memo", "MEMO");
        TYPES.put("note", "MEMO");
        TYPES.put("equipement", "EQUIPMENT");
        TYPES.put("materiel", "EQUIPMENT");
    }

    /** Mots proposés à l'autocomplétion (un par type). */
    public static final List<String> SUGGESTED_TYPES =
            Collections.unmodifiableList(Arrays.asList("incident", "autorisation", "memo", "equipement"));

    public final String type;
    public final String subject;
    public final String content;
    public final String error;

    private ReportRequest(String type, String subject, String content, String error) {
        this.type = type;
        this.subject = subject;
        this.content = content;
        this.error = error;
    }

    public boolean isValid() {
        return error == null;
    }

    public static ReportRequest parse(String[] args) {
        if (args == null || args.length < 2) {
            return invalid("Usage : /rapport <incident|autorisation|memo|equipement> <sujet> | <description>");
        }
        String type = TYPES.get(normalize(args[0]));
        if (type == null) {
            return invalid("Type inconnu « " + args[0] + " ». Types : incident, autorisation, memo, equipement.");
        }
        String rest = String.join(" ", Arrays.copyOfRange(args, 1, args.length)).trim();
        int bar = rest.indexOf('|');
        if (bar < 0) {
            return invalid("Sépare le sujet de la description par « | ». Ex. : /rapport incident Fuite Bloc B | Description...");
        }
        String subject = rest.substring(0, bar).trim();
        String content = rest.substring(bar + 1).trim();
        return of(type, subject, content);
    }

    /** Validation commune à la commande en une ligne et au formulaire papier. */
    public static ReportRequest of(String coreType, String subject, String content) {
        if (coreType == null || !TYPES.containsValue(coreType)) {
            return invalid("Type de rapport inconnu.");
        }
        if (subject.length() < SUBJECT_MIN || subject.length() > SUBJECT_MAX) {
            return invalid("Le sujet doit faire entre " + SUBJECT_MIN + " et " + SUBJECT_MAX + " caractères.");
        }
        if (content.length() < CONTENT_MIN || content.length() > CONTENT_MAX) {
            return invalid("La description doit faire entre " + CONTENT_MIN + " et " + CONTENT_MAX + " caractères.");
        }
        return new ReportRequest(coreType, subject, content, null);
    }

    static ReportRequest invalid(String error) {
        return new ReportRequest(null, null, null, error);
    }

    /** Insensible à la casse et aux accents : « Équipement », « MÉMO » passent. */
    private static String normalize(String word) {
        return Normalizer.normalize(word, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }
}
