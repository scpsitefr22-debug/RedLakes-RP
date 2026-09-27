package fr.redlakes.mc.queue;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import com.google.gson.reflect.TypeToken;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * File d'attente persistante des écritures Minecraft → CORE (§60-61 du
 * cahier Minecraft). Chaque entrée garde son eventId de la saisie jusqu'à
 * l'acceptation par le CORE, qui déduplique : un renvoi après panne ou
 * redémarrage ne crée jamais de doublon. Écrite sur disque à chaque
 * changement (fichier temporaire puis remplacement) pour survivre à un
 * arrêt brutal du serveur. Java pur — aucune dépendance Bukkit.
 *
 * Ce n'est pas une source de vérité RP : une entrée n'est qu'un envoi en
 * attente, supprimée dès que le CORE l'a acceptée ou définitivement refusée.
 */
public final class Outbox {

    public static final class Entry {
        public String eventId;
        public String type;
        public String playerUuid;
        public String playerName;
        /** Corps JSON exact à envoyer (eventId inclus). */
        public String payload;
        public long createdAt;
        public int attempts;
        public String lastError;
    }

    private static final Type LIST_TYPE = new TypeToken<List<Entry>>() { }.getType();

    private final File file;
    private final int maxEntries;
    private final Gson gson = new GsonBuilder().setPrettyPrinting().disableHtmlEscaping().create();
    private final Map<String, Entry> entries = new LinkedHashMap<>();

    public Outbox(File file, int maxEntries) {
        this.file = file;
        this.maxEntries = maxEntries;
    }

    /** Recharge les envois en attente d'une exécution précédente. Un fichier illisible est mis de côté, jamais effacé. */
    public synchronized int load() throws IOException {
        entries.clear();
        if (!file.exists()) {
            return 0;
        }
        try (Reader reader = new InputStreamReader(Files.newInputStream(file.toPath()), StandardCharsets.UTF_8)) {
            List<Entry> loaded = gson.fromJson(reader, LIST_TYPE);
            if (loaded != null) {
                for (Entry e : loaded) {
                    if (e != null && e.eventId != null && e.payload != null) {
                        entries.put(e.eventId, e);
                    }
                }
            }
        } catch (JsonParseException e) {
            File broken = new File(file.getParentFile(), file.getName() + ".corrompu-" + System.currentTimeMillis());
            Files.move(file.toPath(), broken.toPath(), StandardCopyOption.REPLACE_EXISTING);
            throw new IOException("Outbox illisible, déplacée vers " + broken.getName(), e);
        }
        return entries.size();
    }

    /** false si la file est pleine (on refuse plutôt que de grossir sans limite pendant une longue panne). */
    public synchronized boolean add(Entry entry) throws IOException {
        if (entries.size() >= maxEntries && !entries.containsKey(entry.eventId)) {
            return false;
        }
        entries.put(entry.eventId, entry);
        persist();
        return true;
    }

    public synchronized void remove(String eventId) throws IOException {
        if (entries.remove(eventId) != null) {
            persist();
        }
    }

    public synchronized void recordFailure(String eventId, String error) throws IOException {
        Entry e = entries.get(eventId);
        if (e != null) {
            e.attempts++;
            e.lastError = error;
            persist();
        }
    }

    /** Copie (ordre d'arrivée) — on peut la parcourir pendant que d'autres threads ajoutent. */
    public synchronized List<Entry> snapshot() {
        return Collections.unmodifiableList(new ArrayList<>(entries.values()));
    }

    public synchronized int size() {
        return entries.size();
    }

    private void persist() throws IOException {
        File parent = file.getParentFile();
        if (parent != null && !parent.exists() && !parent.mkdirs()) {
            throw new IOException("Impossible de créer " + parent);
        }
        File tmp = new File(parent, file.getName() + ".tmp");
        try (Writer writer = new OutputStreamWriter(Files.newOutputStream(tmp.toPath()), StandardCharsets.UTF_8)) {
            gson.toJson(new ArrayList<>(entries.values()), LIST_TYPE, writer);
        }
        Files.move(tmp.toPath(), file.toPath(), StandardCopyOption.REPLACE_EXISTING);
    }
}
