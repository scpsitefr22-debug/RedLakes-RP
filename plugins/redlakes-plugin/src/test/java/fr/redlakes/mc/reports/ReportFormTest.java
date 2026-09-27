package fr.redlakes.mc.reports;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Lecture du formulaire papier tel qu'un joueur le remplit réellement. */
class ReportFormTest {

    /** Le joueur écrit sous les rubriques du modèle, sans les toucher. */
    private static List<String> filled(String subject, String... descriptionPages) {
        List<String> pages = ReportForm.templatePages("Rapport d'intervention");
        pages.set(0, pages.get(0) + subject);
        pages.set(1, pages.get(1) + descriptionPages[0]);
        for (int i = 1; i < descriptionPages.length; i++) {
            pages.add(descriptionPages[i]);
        }
        return pages;
    }

    @Test
    void readsTheSubjectAndAMultiPageDescription() {
        ReportRequest r = ReportForm.read("INCIDENT", filled("Rixe devant le bar",
                "Deux individus en venaient aux mains vers 22h.",
                "Suite : un témoin a été entendu, déposition jointe."));
        assertTrue(r.isValid(), r.error);
        assertEquals("INCIDENT", r.type);
        assertEquals("Rixe devant le bar", r.subject);
        assertEquals("Deux individus en venaient aux mains vers 22h.\nSuite : un témoin a été entendu, déposition jointe.",
                r.content);
    }

    @Test
    void subjectWrittenOnSeveralLinesBecomesOneLine() {
        ReportRequest r = ReportForm.read("MEMO", filled("Relève\nde l'équipe A", "Relève prévue à 16h au poste nord."));
        assertEquals("Relève de l'équipe A", r.subject);
    }

    @Test
    void everythingWrittenOnPageOneStillWorks() {
        List<String> pages = Collections.singletonList(
                "FORMULAIRE REDLAKES\nMémo interne\n\n" + ReportForm.SUBJECT_MARKER + "\nPause café\n"
                        + ReportForm.CONTENT_MARKER + "\nLa machine du 2e étage est réparée.");
        ReportRequest r = ReportForm.read("MEMO", pages);
        assertTrue(r.isValid(), r.error);
        assertEquals("Pause café", r.subject);
        assertEquals("La machine du 2e étage est réparée.", r.content);
    }

    @Test
    void emptyFormIsRefusedWithAClearReason() {
        ReportRequest r = ReportForm.read("INCIDENT", ReportForm.templatePages("Rapport d'incident"));
        assertFalse(r.isValid());
        assertTrue(r.error.contains("sujet"));
    }

    @Test
    void erasedSubjectMarkerIsExplained() {
        ReportRequest r = ReportForm.read("INCIDENT", Arrays.asList("J'ai tout effacé", "Description :\nUn long texte ici."));
        assertFalse(r.isValid());
        assertTrue(r.error.contains(ReportForm.SUBJECT_MARKER));
    }

    @Test
    void colorCodesTypedByPlayersAreIgnored() {
        ReportRequest r = ReportForm.read("INCIDENT", filled("§cAlerte §lrouge", "§7Texte gris de plus de dix caractères."));
        assertEquals("Alerte rouge", r.subject);
        assertEquals("Texte gris de plus de dix caractères.", r.content);
    }

    @Test
    void tooLongDescriptionIsRefused() {
        StringBuilder page = new StringBuilder();
        for (int i = 0; i < 260; i++) {
            page.append('x');
        }
        String[] pages = new String[17];
        Arrays.fill(pages, page.toString());
        assertFalse(ReportForm.read("INCIDENT", filled("Sujet valide", pages)).isValid());
    }

    @Test
    void formTypeIsRecoveredFromTheHiddenLoreLineEvenWithColors() {
        assertEquals("EQUIPMENT", ReportForm.typeFromLore(Arrays.asList("§7Remplis-le", "§0" + ReportForm.loreTag("EQUIPMENT"))));
        assertNull(ReportForm.typeFromLore(Arrays.asList("Un livre ordinaire")));
        assertNull(ReportForm.typeFromLore(null));
    }

    @Test
    void factionVocabularyFromCoreWinsOverDefaults() {
        Map<String, String> police = new HashMap<>();
        police.put("INCIDENT", "Rapport d'intervention");
        assertEquals("Rapport d'intervention", ReportForm.labelFor(police, "INCIDENT"));
        assertEquals("Mémo interne", ReportForm.labelFor(police, "MEMO"));
        assertEquals("Réquisition matériel", ReportForm.labelFor(null, "EQUIPMENT"));
    }
}
