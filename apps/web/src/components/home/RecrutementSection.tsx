"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PenLine, Hammer, Shield, MessageSquare } from "lucide-react";
import { siteConfig } from "@/config/site";

const roles = [
  {
    icon: Shield,
    title: "Staff & Modération",
    desc: "Gestion du serveur, events, support joueurs.",
    type: "STAFF",
  },
  {
    icon: PenLine,
    title: "Rédacteur Lore",
    desc: "SCP, factions, personnages, chronologie.",
    type: "LORE",
  },
  {
    icon: Hammer,
    title: "Builder / Map",
    desc: "Site-12, ville, zones RP, égouts.",
    type: "BUILD",
  },
  {
    icon: MessageSquare,
    title: "Community Manager",
    desc: "Discord, actualités, communication.",
    type: "ADMINISTRATION",
  },
];

export function RecrutementSection() {
  if (!siteConfig.recruitmentOpen) return null;

  return (
    <section className="border-t border-redlake/10 bg-classified py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            RECRUTEMENT PRÉ-OUVERTURE
          </p>
          <h2 className="text-3xl font-bold text-white">Rejoignez le projet</h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Le serveur n&apos;est pas encore ouvert, mais nous recrutons dès maintenant
            pour construire REDLAKES ensemble.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="hologram-border rounded-lg p-5"
            >
              <role.icon className="mb-3 h-6 w-6 text-redlake-glow" />
              <h3 className="mb-2 font-bold text-white">{role.title}</h3>
              <p className="mb-4 text-sm text-gray-500">{role.desc}</p>
              <Link
                href={`/candidatures?type=${role.type}`}
                className="font-mono text-xs text-redlake-glow hover:underline"
              >
                Candidater →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
