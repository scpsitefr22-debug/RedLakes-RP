package fr.redlakes.mc.reports;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Formulaire papier de rapport (livre et plume) — mise en page et lecture.
 * Java pur, sans Bukkit : testable directement.
 *
 * Page 1 : en-tête + « Sujet (1 ligne) : » puis le sujet écrit par le joueur.
 * Pages 2+ : « Description : » puis le texte libre, sur autant de pages
 * que nécessaire. Tout ce qui précède les rubriques est ignoré à la lecture.
 */
public final class ReportForm {

    public static final String SUBJECT_MARKER = "Sujet (1 ligne) :";
    public static final String CONTENT_MARKER = "Description :";
    /** Préfixe caché dans la description (lore) de l'objet pour le reconnaître. */
    public static final String LORE_TAG = "rl-form:";

    /** Libellés par défaut (Fondation) si le CORE n'en fournit pas pour la faction. */
    private static final Map<String, String> DEFAULT_LABELS = new HashMap<>();

    static {
        DEFAULT_LABELS.put("INCIDENT", "Rapport d'incident");
        DEFAULT_LABELS.put("AUTHORIZATION", "Demande d'autorisation");
        DEFAULT_LABELS.put("MEMO", "Mémo interne");
        DEFAULT_LABELS.put("EQUIPMENT", "Réquisition matériel");
    }

    private ReportForm() {
    }

    /** Vocabulaire de la faction servi par le CORE, sinon libellé par défaut. */
    public static String labelFor(Map<String, String> factionLabels, String coreType) {
        if (factionLabels != null) {
            String label = factionLabels.get(coreType);
            if (label != null && !label.trim().isEmpty()) {
                return label;
            }
        }
        String fallback = DEFAULT_LABELS.get(coreType);
        return fallback != null ? fallback : coreType;
    }

    public static List<String> templatePages(String typeLabel) {
        return new ArrayList<>(Arrays.asList(
                "FORMULAIRE REDLAKES\n" + typeLabel + "\n\n" + SUBJECT_MARKER + "\n",
                CONTENT_MARKER + "\n"));
    }

    public static String loreTag(String coreType) {
        return LORE_TAG + coreType;
    }

    /** Type CORE caché dans une ligne de lore (codes couleur retirés), ou null. */
    public static String typeFromLore(List<String> lore) {
        if (lore == null) {
            return null;
        }
        for (String line : lore) {
            String plain = stripColors(line);
            if (plain.startsWith(LORE_TAG)) {
                return plain.substring(LORE_TAG.length()).trim();
            }
        }
        return null;
    }

    /** Lit les pages remplies : même validation que /rapport en une ligne. */
    public static ReportRequest read(String coreType, List<String> pages) {
        if (pages == null || pages.isEmpty()) {
            return ReportRequest.invalid("Le formulaire est vide.");
        }
        String first = stripColors(pages.get(0));
        int subjectAt = first.indexOf(SUBJECT_MARKER);
        if (subjectAt < 0) {
            return ReportRequest.invalid("Garde la ligne « " + SUBJECT_MARKER + " » en page 1 et écris le sujet dessous.");
        }
        String afterSubject = first.substring(subjectAt + SUBJECT_MARKER.length());

        // Description sur la page 1 (si le joueur a tout écrit d'un bloc) et/ou les pages suivantes.
        StringBuilder rest = new StringBuilder();
        String subjectPart = afterSubject;
        int contentOnFirst = afterSubject.indexOf(CONTENT_MARKER);
        if (contentOnFirst >= 0) {
            subjectPart = afterSubject.substring(0, contentOnFirst);
            rest.append(afterSubject.substring(contentOnFirst + CONTENT_MARKER.length()));
        }
        for (int i = 1; i < pages.size(); i++) {
            String page = stripColors(pages.get(i));
            if (i == 1) {
                int at = page.indexOf(CONTENT_MARKER);
                if (at >= 0) {
                    page = page.substring(at + CONTENT_MARKER.length());
                }
            }
            rest.append('\n').append(page);
        }

        String subject = subjectPart.replaceAll("\\s+", " ").trim();
        String content = rest.toString().replaceAll("[ \\t]+\\n", "\n").replaceAll("\\n{3,}", "\n\n").trim();
        return ReportRequest.of(coreType, subject, content);
    }

    static String stripColors(String text) {
        return text == null ? "" : text.replaceAll("§[0-9a-fk-orA-FK-OR]", "");
    }
}
