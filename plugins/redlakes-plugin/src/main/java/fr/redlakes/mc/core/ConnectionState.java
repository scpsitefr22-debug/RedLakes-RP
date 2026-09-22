package fr.redlakes.mc.core;

/** Cf. §07 du cahier des charges — le cache n'est jamais une seconde source de vérité, seulement un maintien temporaire. */
public enum ConnectionState {
    ONLINE,
    DEGRADED,
    OFFLINE
}
