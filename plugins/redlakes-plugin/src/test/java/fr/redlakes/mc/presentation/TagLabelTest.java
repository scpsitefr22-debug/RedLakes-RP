package fr.redlakes.mc.presentation;

import fr.redlakes.mc.player.MinecraftSession;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Logique partagée par PresentationManager (nametag/tablist) et ChatFormatListener (chat). */
class TagLabelTest {

    private static MinecraftSession session(boolean showTag, String departmentName, String factionName) {
        MinecraftSession s = new MinecraftSession();
        s.hasCharacter = true;
        s.faction = new MinecraftSession.Faction();
        s.faction.name = factionName;
        s.faction.showAffiliationTag = showTag;
        if (departmentName != null) {
            s.department = new MinecraftSession.Department();
            s.department.name = departmentName;
        }
        return s;
    }

    @Test
    void hiddenWhenShowAffiliationTagIsFalse() {
        MinecraftSession s = session(false, "Sécurité", "Fondation SCP");
        assertFalse(TagLabel.shouldShow(s));
        assertEquals("", TagLabel.shortLabel(s));
    }

    @Test
    void hiddenWhenFactionIsNull() {
        MinecraftSession s = new MinecraftSession();
        s.hasCharacter = true;
        assertFalse(TagLabel.shouldShow(s));
        assertEquals("", TagLabel.shortLabel(s));
    }

    @Test
    void prefersDepartmentOverFactionWhenBothPresent() {
        MinecraftSession s = session(true, "Sécurité", "Fondation SCP");
        assertEquals("SÉCU", TagLabel.shortLabel(s));
    }

    @Test
    void fallsBackToFactionWhenNoDepartment() {
        MinecraftSession s = session(true, null, "Police");
        assertEquals("POLI", TagLabel.shortLabel(s));
    }

    @Test
    void truncatesToFourUppercaseCharacters() {
        MinecraftSession s = session(true, "Recherche", null);
        String label = TagLabel.shortLabel(s);
        assertEquals(4, label.length());
        assertEquals(label, label.toUpperCase());
    }

    @Test
    void doesNotTruncateShorterWords() {
        MinecraftSession s = session(true, "GOC", null);
        assertEquals("GOC", TagLabel.shortLabel(s));
    }

    @Test
    void onlyUsesFirstWordOfMultiWordName() {
        MinecraftSession s = session(true, "Direction du Site", null);
        assertEquals("DIRE", TagLabel.shortLabel(s));
    }

    @Test
    void showAffiliationTagTrueWithUsableNameIsShown() {
        MinecraftSession s = session(true, "Sécurité", "Fondation SCP");
        assertTrue(TagLabel.shouldShow(s));
    }
}
