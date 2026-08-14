"use client";

import { motion } from "framer-motion";
import { Clock, BookOpen, Users, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export function ComingSoonSection() {
  return (
    <section className="border-y border-redlake/20 bg-redlake/5 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 font-mono text-sm text-yellow-400">
            <Clock className="h-4 w-4" />
            SERVEUR EN PRÉPARATION
          </div>

          <h2 className="mb-4 text-3xl font-bold text-white">
            Ouverture prochaine
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-400">
            {siteConfig.openingMessage}
          </p>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Explorez le lore",
                desc: "Wiki SCP, factions, chronologie — tout est déjà là.",
                href: "/wiki",
              },
              {
                icon: Users,
                title: "Rejoignez l'équipe",
                desc: "Staff, rédacteurs lore, builders — candidatures ouvertes.",
                href: "/candidatures",
              },
              {
                icon: Shield,
                title: "Découvrez Site-12",
                desc: "Organigramme complet, grades et départements.",
                href: "/departements/site-12",
              },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hologram-border rounded-lg p-5 text-left transition-colors hover:border-redlake/40"
              >
                <item.icon className="mb-3 h-6 w-6 text-redlake-glow" />
                <h3 className="mb-1 font-bold text-white">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/wiki" variant="primary">
              Explorer l&apos;encyclopédie
            </Button>
            {siteConfig.recruitmentOpen && (
              <Button href="/candidatures" variant="secondary">
                Candidater avant l&apos;ouverture
              </Button>
            )}
            {siteConfig.discordInvite && (
              <Button href={siteConfig.discordInvite} variant="secondary">
                <MessageCircle className="h-4 w-4" />
                Rejoindre le Discord
              </Button>
            )}
          </div>

          <p className="mt-6 font-mono text-xs text-gray-600">
            IP serveur : {siteConfig.serverIp} (inactive)
          </p>
        </motion.div>
      </div>
    </section>
  );
}
