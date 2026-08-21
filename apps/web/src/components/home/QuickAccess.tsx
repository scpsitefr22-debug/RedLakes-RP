"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Skull, FileLock, Users, Image } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const quickLinks = [
  {
    icon: MapPin,
    title: "Carte Interactive",
    description: "Explorez Site-12, la ville, les égouts et les zones criminelles.",
    href: "/carte",
  },
  {
    icon: Skull,
    title: "OPHIS",
    description: "Entité anormale reliée au réseau CORE — répond aux questions, à contrecœur.",
    href: "/ophis",
  },
  {
    icon: FileLock,
    title: "Archives Classifiées",
    description: "Contenu débloqué selon votre département d'affectation.",
    href: "/archives",
  },
  {
    icon: Users,
    title: "Base Joueurs",
    description: "Profils, grades, réputation et médailles.",
    href: "/joueurs",
  },
  {
    icon: Image,
    title: "Galerie",
    description: "Screenshots, événements et confinements.",
    href: "/galerie",
  },
];

export function QuickAccess() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader align="center" kicker="ACCÈS RAPIDE" title="Systèmes Interactifs" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={link.href}
                className="group flex h-full gap-4 hologram-border rounded-lg p-5 transition-all hover:border-redlake/40"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-redlake/30 bg-redlake/10">
                  <link.icon className="h-5 w-5 text-redlake-glow" />
                </div>
                <div>
                  <h3 className="mb-1 font-bold text-white group-hover:text-redlake-glow">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
