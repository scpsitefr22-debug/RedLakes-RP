"use client";

import { motion } from "framer-motion";
import { FlaskConical, Landmark, BookOpen, Box } from "lucide-react";
import { siteConfig } from "@/config/site";
import { SectionHeader } from "@/components/ui/SectionHeader";

const concepts = [
  {
    title: "SCP Roleplay",
    icon: FlaskConical,
    description:
      "Confinement, recherche, protocoles de sécurité. Chaque anomalie a sa fiche, son histoire et ses règles de jeu.",
  },
  {
    title: "DarkRP & Crime",
    icon: Landmark,
    description:
      "Ville de REDLAKES, mafia, cartels, police et gouvernement. La surface cache ce qui se passe sous terre.",
  },
  {
    title: "Univers original",
    icon: BookOpen,
    description:
      "Site-12, A.E.G.I.S., Main du Serpent — un lore propriétaire mêlant horreur, conspiration et science-fiction.",
  },
  {
    title: "Minecraft Java",
    icon: Box,
    description:
      "Builds immersifs, plugins custom, grades RP et événements narratifs orchestrés par le staff.",
  },
];

export function ConceptSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          align="center"
          kicker="DOSSIER DE PRÉSENTATION"
          title="Le concept REDLAKES"
          description="Un serveur Minecraft RP où la Fondation SCP possède son encyclopédie, son réseau militaire et ses archives classifiées."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {concepts.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="panel-elevated rounded-lg p-6"
            >
              <c.icon className="mb-3 h-6 w-6 text-redlake-glow" />
              <h3 className="mb-2 text-xl font-bold text-white">{c.title}</h3>
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
