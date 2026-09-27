package fr.redlakes.mc.player;

import java.util.List;
import java.util.Map;

/**
 * Reflet exact de la réponse GET /sync/minecraft/:uuid côté CORE
 * (apps/api/src/sync/sync.service.ts#getMinecraftSession). Ne pas ajouter
 * de champ ici tant qu'il n'existe pas réellement côté API.
 */
public final class MinecraftSession {

    public boolean linked;
    public boolean hasCharacter;
    public String userId;
    public String minecraftUsername;
    public String characterId;
    public String rpFirstName;
    public String rpLastName;
    public Grade grade;
    public Faction faction;
    public Department department;
    public Team team;
    public List<Sanction> activeSanctions;
    public List<Mission> missions;
    /** Affectation temporaire d'opération (RpEvent ACTIVE), null hors opération. */
    public EventAssignment eventAssignment;
    public String roleUpdatedAt;

    public static final class Grade {
        public String id;
        public String slug;
        public String name;
        public int clearanceLevel;
        public List<String> accessZones;
        public List<String> siteSections;
    }

    public static final class Faction {
        public String id;
        public String slug;
        public String name;
        public boolean showAffiliationTag;
        /** Vocabulaire RP des types de rapport (INCIDENT → « Rapport d'intervention »...). */
        public Map<String, String> reportLabels;
    }

    public static final class Department {
        public String id;
        public String slug;
        public String name;
    }

    public static final class Team {
        public String id;
        public String slug;
        public String name;
    }

    public static final class Sanction {
        public String id;
        public String type;
        public String reason;
        public String issuedAt;
        public String expiresAt;
    }

    public static final class Mission {
        public String id;
        public String title;
        public String description;
        public String reward;
        public String dueAt;
        public boolean isTeamMission;
    }

    public static final class EventAssignment {
        public String id;
        public String eventId;
        public String eventTitle;
        public String briefing;
        public String startedAt;
        public String roleLabel;
        public Department department;
        public String sector;
        public String equipment;
        public String instruction;
    }
}
