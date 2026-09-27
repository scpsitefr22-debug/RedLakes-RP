package fr.redlakes.mc.reports;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReportRequestTest {

    private static ReportRequest parse(String line) {
        return ReportRequest.parse(line.split(" "));
    }

    @Test
    void parsesTypeSubjectAndDescription() {
        ReportRequest r = parse("incident Fuite Bloc B | Fuite de liquide dans le couloir 3, secteur bouclé.");
        assertTrue(r.isValid());
        assertEquals("INCIDENT", r.type);
        assertEquals("Fuite Bloc B", r.subject);
        assertEquals("Fuite de liquide dans le couloir 3, secteur bouclé.", r.content);
    }

    @Test
    void typeIsCaseAndAccentInsensitive() {
        assertEquals("EQUIPMENT", parse("Équipement Radio HS | La radio du poste 2 ne s'allume plus.").type);
        assertEquals("MEMO", parse("MÉMO Réunion | Réunion de service demain à 9h.").type);
        assertEquals("AUTHORIZATION", parse("autorisation Accès labo | Demande d'accès au labo B pour test.").type);
        assertEquals("EQUIPMENT", parse("materiel Gants | Stock de gants épuisé en salle 4.").type);
    }

    @Test
    void descriptionMayContainAnotherBar() {
        ReportRequest r = parse("memo Horaires | Équipe A 8h-16h | équipe B 16h-00h.");
        assertTrue(r.isValid());
        assertEquals("Équipe A 8h-16h | équipe B 16h-00h.", r.content);
    }

    @Test
    void rejectsUnknownTypeMissingBarAndBadLengths() {
        assertFalse(parse("plainte Voisin | Le voisin fait trop de bruit la nuit.").isValid());
        assertFalse(parse("incident Fuite sans séparateur du tout ici").isValid());
        assertFalse(parse("incident Fu | Description assez longue.").isValid());
        assertFalse(parse("incident Fuite Bloc B | Court").isValid());
        assertFalse(ReportRequest.parse(new String[] {"incident"}).isValid());
        assertFalse(ReportRequest.parse(new String[0]).isValid());
    }

    @Test
    void boundsMatchTheCoreDto() {
        StringBuilder longSubject = new StringBuilder();
        for (int i = 0; i < ReportRequest.SUBJECT_MAX + 1; i++) {
            longSubject.append('a');
        }
        assertFalse(parse("incident " + longSubject + " | Description assez longue.").isValid());
    }
}
