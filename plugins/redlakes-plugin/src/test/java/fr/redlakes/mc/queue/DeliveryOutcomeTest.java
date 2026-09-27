package fr.redlakes.mc.queue;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DeliveryOutcomeTest {

    @Test
    void acceptedOrAlreadyReceivedIsDelivered() {
        assertEquals(DeliveryOutcome.DELIVERED, DeliveryOutcome.forStatus(200));
        assertEquals(DeliveryOutcome.DELIVERED, DeliveryOutcome.forStatus(201));
    }

    @Test
    void invalidDataOrUnlinkedAccountIsDroppedNotRetriedForever() {
        assertEquals(DeliveryOutcome.REJECTED, DeliveryOutcome.forStatus(400));
        assertEquals(DeliveryOutcome.REJECTED, DeliveryOutcome.forStatus(404));
        assertEquals(DeliveryOutcome.REJECTED, DeliveryOutcome.forStatus(422));
    }

    @Test
    void outagesAndServerKeyProblemsAreKeptForLater() {
        assertEquals(DeliveryOutcome.RETRY, DeliveryOutcome.forStatus(500));
        assertEquals(DeliveryOutcome.RETRY, DeliveryOutcome.forStatus(503));
        assertEquals(DeliveryOutcome.RETRY, DeliveryOutcome.forStatus(429));
        // Clé serveur invalide : corriger config.yml doit débloquer la file, pas la vider.
        assertEquals(DeliveryOutcome.RETRY, DeliveryOutcome.forStatus(401));
    }
}
