"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { factions } from "@/data/factions";
import { Shield } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function FactionsPreview() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          align="center"
          kicker="ORGANISATIONS ACTIVES"
          title="Factions"
          description="De la Fondation SCP à A.E.G.I.S., en passant par l'Insurrection du Chaos et la Main du Serpent — chaque faction façonne le destin de REDLAKES."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {factions.map((faction, i) => (
            <motion.div
              key={faction.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/factions/${faction.id}`}
                className="group block h-full hologram-border rounded-lg p-5 transition-all hover:border-redlake/50"
                style={{ borderLeftColor: faction.color, borderLeftWidth: 3 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" style={{ color: faction.color }} />
                  <h3 className="font-bold text-white group-hover:text-redlake-glow">
                    {faction.name}
                  </h3>
                </div>
                <p className="mb-3 text-xs italic text-gray-500">{faction.tagline}</p>
                <p className="line-clamp-3 text-sm text-gray-600">
                  {faction.description}
                </p>
                {faction.playable && (
                  <span className="mt-3 inline-block font-mono text-[10px] text-green-400">
                    JOUABLE
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
