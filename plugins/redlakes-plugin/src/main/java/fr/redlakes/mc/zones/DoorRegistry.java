package fr.redlakes.mc.zones;

import org.bukkit.Location;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Persistance des portes dans doors.yml (dossier de données du plugin).
 * Accédé uniquement depuis le thread principal (commandes + PlayerInteractEvent
 * sont tous deux synchrones côté Bukkit) — pas besoin de verrou, la map
 * concurrente est une précaution bon marché, pas une nécessité ici.
 */
public final class DoorRegistry {

    private final Map<String, Door> doors = new ConcurrentHashMap<>();
    private final File file;
    private final Logger logger;

    public DoorRegistry(File dataFolder, Logger logger) {
        this.file = new File(dataFolder, "doors.yml");
        this.logger = logger;
        load();
    }

    public void add(Door door) {
        doors.put(door.key(), door);
        save();
    }

    public Door remove(String world, int x, int y, int z) {
        Door removed = doors.remove(Door.key(world, x, y, z));
        if (removed != null) {
            save();
        }
        return removed;
    }

    public Door find(Location location) {
        return doors.get(Door.key(location.getWorld().getName(), location.getBlockX(), location.getBlockY(), location.getBlockZ()));
    }

    public Collection<Door> all() {
        return doors.values();
    }

    private void load() {
        if (!file.exists()) {
            return;
        }
        YamlConfiguration yaml = YamlConfiguration.loadConfiguration(file);
        for (String key : yaml.getKeys(false)) {
            String world = yaml.getString(key + ".world");
            int x = yaml.getInt(key + ".x");
            int y = yaml.getInt(key + ".y");
            int z = yaml.getInt(key + ".z");
            int clearance = yaml.getInt(key + ".required-clearance", 1);
            String department = yaml.getString(key + ".required-department", null);
            Door door = new Door(world, x, y, z, clearance, department);
            doors.put(door.key(), door);
        }
        logger.info(doors.size() + " porte(s) chargée(s) depuis doors.yml");
    }

    private void save() {
        YamlConfiguration yaml = new YamlConfiguration();
        int index = 0;
        for (Door door : doors.values()) {
            String key = "door-" + (index++);
            yaml.set(key + ".world", door.world);
            yaml.set(key + ".x", door.x);
            yaml.set(key + ".y", door.y);
            yaml.set(key + ".z", door.z);
            yaml.set(key + ".required-clearance", door.requiredClearance);
            if (door.requiredDepartmentSlug != null) {
                yaml.set(key + ".required-department", door.requiredDepartmentSlug);
            }
        }
        try {
            yaml.save(file);
        } catch (IOException e) {
            logger.log(Level.WARNING, "Impossible de sauvegarder doors.yml", e);
        }
    }
}
