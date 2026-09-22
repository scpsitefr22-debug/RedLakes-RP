plugins {
    java
}

group = "fr.redlakes"
version = "0.1.0"

repositories {
    mavenCentral()
    maven("https://hub.spigotmc.org/nexus/content/repositories/snapshots/")
    // bungeecord-chat (dépendance transitive de spigot-api) a été purgé du
    // repo Spigot pour cette build précise — repo miroir PaperMC en secours.
    maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
    // API Spigot 1.12.2 — Mohist expose cette API pour les plugins Bukkit/Spigot
    // en plus de la couche Forge. Gson est apporté transitivement par spigot-api.
    compileOnly("org.spigotmc:spigot-api:1.12.2-R0.1-SNAPSHOT")
}

java {
    toolchain.languageVersion.set(JavaLanguageVersion.of(8))
}

tasks.withType<JavaCompile> {
    // Sans ça, javac lit les .java (UTF-8) avec l'encodage par défaut de la
    // plateforme sous Windows (Cp1252) et fige des accents corrompus dans le
    // .jar compilé — visible en jeu (ex: "État" -> "Ãxtat").
    options.encoding = "UTF-8"
}

tasks.processResources {
    filesMatching("plugin.yml") {
        expand("version" to project.version)
    }
}

tasks.jar {
    archiveFileName.set("RedLakesPlugin-${project.version}.jar")
}
