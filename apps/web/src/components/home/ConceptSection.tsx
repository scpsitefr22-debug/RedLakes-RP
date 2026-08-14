"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";

const concepts = [
  {
    title: "SCP Roleplay",
    description:
      "Confinement, recherche, protocoles de sécurité. Chaque anomalie a sa fiche, son histoire et ses règles de jeu.",
  },
  {
    title: "DarkRP & Crime",
    description:
      "Ville de REDLAKES, mafia, cartels, police et gouvernement. La surface cache ce qui se passe sous terre.",
  },
  {
    title: "Univers original",
    description:
      "Site-12, A.E.G.I.S., Main du Serpent — un lore propriétaire mêlant horreur, conspiration et science-fiction.",
  },
  {
    title: "Minecraft Java",
    description:
      "Builds immersifs, plugins custom, grades RP et événements narratifs orchestrés par le staff.",
  },
];

export function ConceptSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            DOSSIER DE PRÉSENTATION
          </p>
          <h2 className="text-3xl font-bold text-white">Le concept REDLAKES</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Un serveur Minecraft RP où la Fondation SCP possède son encyclopédie,
            son réseau militaire et ses archives classifiées.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {concepts.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="hologram-border rounded-lg p-6"
            >
              <h3 className="mb-2 text-xl font-bold text-redlake-glow">{c.title}</h3>
              <p className="text-gray-400">{c.description}</p>
            </motion.div>
          ))}
        </div>

        {!siteConfig.serverOpen && (
          <p className="mt-10 text-center font-mono text-sm text-gray-600">
            ▌ Phase actuelle : construction du lore et recrutement de l&apos;équipe
          </p>
        )}
      </div>
    </section>
  );
}
