package fr.redlakes.mc.core;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RetryPolicyTest {

    @Test
    void onlyTransientStatusesAreRetryable() {
        assertTrue(RetryPolicy.isRetryableStatus(500));
        assertTrue(RetryPolicy.isRetryableStatus(503));
        assertTrue(RetryPolicy.isRetryableStatus(408));
        assertTrue(RetryPolicy.isRetryableStatus(429));

        assertFalse(RetryPolicy.isRetryableStatus(200));
        assertFalse(RetryPolicy.isRetryableStatus(401));
        assertFalse(RetryPolicy.isRetryableStatus(404));
        assertFalse(RetryPolicy.isRetryableStatus(400));
    }

    @Test
    void delayDoublesAndIsCapped() {
        RetryPolicy policy = new RetryPolicy(5, 500, 1500);
        assertEquals(0, policy.delayBeforeAttempt(1));
        assertEquals(500, policy.delayBeforeAttempt(2));
        assertEquals(1000, policy.delayBeforeAttempt(3));
        assertEquals(1500, policy.delayBeforeAttempt(4));
        assertEquals(1500, policy.delayBeforeAttempt(5));
    }

    @Test
    void maxAttemptsIsClampedBetweenOneAndFive() {
        assertEquals(1, new RetryPolicy(0, 100, 100).getMaxAttempts());
        assertEquals(1, new RetryPolicy(-3, 100, 100).getMaxAttempts());
        assertEquals(5, new RetryPolicy(50, 100, 100).getMaxAttempts());
        assertEquals(3, new RetryPolicy(3, 100, 100).getMaxAttempts());
    }
}
