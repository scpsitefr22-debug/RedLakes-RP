package fr.redlakes.mc.frames;

import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Lecture du fichier de cadres à re-pointer (/rl staff cadres). */
class FrameUpdateTest {

    private static final String LABEL =
            "https://raw.githubusercontent.com/scpsitefr22-debug/RedLakes-RP/master/assets/minecraft/cadres/scp-173.png";

    @Test
    void readsOneFramePerLineAndSkipsCommentsAndBlankLines() {
        FrameUpdate.ParseResult result = FrameUpdate.parse(Arrays.asList(
                "# x y z lien", "", "15837 19 16192 " + LABEL, "  -12 5 -40   " + LABEL + "  "));

        assertTrue(result.errors.isEmpty());
        assertEquals(2, result.updates.size());
        FrameUpdate second = result.updates.get(1);
        assertEquals(-12, second.x);
        assertEquals(5, second.y);
        assertEquals(-40, second.z);
        assertEquals(LABEL, second.url);
    }

    @Test
    void buildsTheVanillaCommandThatReplacesTheStoredLink() {
        FrameUpdate update = FrameUpdate.parse(Arrays.asList("1 2 3 " + LABEL)).updates.get(0);

        assertEquals("blockdata 1 2 3 {Photo:\"" + LABEL + "\"}", update.toBlockdataCommand());
    }

    @Test
    void keepsOriginalLinksSoTheChangeCanBeUndone() {
        // Le fichier d'annulation contient des liens que le mod refuse (Fandom) : ils restent acceptés ici.
        String fandom = "https://static.wikia.nocookie.net/x/images/6/66/Label020.png/revision/latest/scale-to-width-down/250?cb=1";

        assertTrue(FrameUpdate.parse(Arrays.asList("1 2 3 " + fandom)).errors.isEmpty());
    }

    @Test
    void refusesLinesThatWouldBreakTheCommand() {
        FrameUpdate.ParseResult result = FrameUpdate.parse(Arrays.asList(
                "1 2 " + LABEL,
                "1 2 3 ftp://exemple.fr/image.png",
                "1 2 3 https://exemple.fr/a\"b.png",
                "1 2 3 https://exemple.fr/a\\b.png",
                "un 2 3 " + LABEL));

        assertTrue(result.updates.isEmpty());
        assertEquals(5, result.errors.size());
        assertTrue(result.errors.get(0).startsWith("ligne 1"));
        assertTrue(result.errors.get(4).contains("coordonnées"));
    }
}
