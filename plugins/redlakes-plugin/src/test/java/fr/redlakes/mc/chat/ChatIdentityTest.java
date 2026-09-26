package fr.redlakes.mc.chat;

import fr.redlakes.mc.player.MinecraftSession;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ChatIdentityTest {

    @Test
    void usesRpNameWhenPresent() {
        MinecraftSession s = new MinecraftSession();
        s.rpFirstName = "Jean";
        s.rpLastName = "Dupont";
        assertEquals("Jean Dupont", ChatIdentity.rpName(s, "Steve123"));
    }

    @Test
    void usesFirstNameOnlyWhenNoLastName() {
        MinecraftSession s = new MinecraftSession();
        s.rpFirstName = "Jean";
        assertEquals("Jean", ChatIdentity.rpName(s, "Steve123"));
    }

    @Test
    void fallsBackToMinecraftNameWhenNoRpFirstName() {
        MinecraftSession s = new MinecraftSession();
        assertEquals("Steve123", ChatIdentity.rpName(s, "Steve123"));
    }

    @Test
    void fallsBackWhenRpFirstNameIsBlank() {
        MinecraftSession s = new MinecraftSession();
        s.rpFirstName = "   ";
        assertEquals("Steve123", ChatIdentity.rpName(s, "Steve123"));
    }
}
