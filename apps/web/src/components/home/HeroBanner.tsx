"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Clock, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-redlake-dark/40 via-black to-black" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(139,10,10,0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139,10,10,0.2) 0%, transparent 40%),
            linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)
          `,
        }}
      />
      <div className="absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-32 w-32 rounded-full border border-redlake/10 opacity-30" />
        <div className="absolute right-[15%] top-[30%] h-48 w-48 rounded-full border border-redlake/5 opacity-20" />
        <div className="absolute bottom-[20%] left-[30%] h-64 w-px bg-gradient-to-b from-transparent via-redlake/30 to-transparent" />
        <div className="absolute bottom-[20%] right-[25%] h-64 w-px bg-gradient-to-b from-transparent via-redlake/20 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="classified" className="mb-6">
            {siteConfig.serverOpen ? (
              <>
                <AlertTriangle className="mr-1 inline h-3 w-3" />
                Site-12 // Accès Restreint
              </>
            ) : (
              <>
                <Clock className="mr-1 inline h-3 w-3" />
                Ouverture prochaine
              </>
            )}
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative mx-auto mb-4 h-20 w-20">
            <Image
              src="/logo-aegis.svg"
              alt="REDLAKES"
              width={80}
              height={80}
              className="opacity-90"
              priority
            />
          </div>
          <h1 className="glitch mb-4 font-mono text-5xl font-bold tracking-[0.3em] text-white md:text-7xl lg:text-8xl">
            REDLAKES
          </h1>
          <p className="font-mono text-lg tracking-[0.5em] text-redlake-glow md:text-xl">
            RP
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8 max-w-xl font-mono text-sm tracking-widest text-gray-400 md:text-base"
        >
          LE SECRET DOIT ÊTRE PRÉSERVÉ
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-10 max-w-2xl text-gray-500"
        >
          SCP Roleplay × DarkRP × Univers Original sur Minecraft Java. Entrez dans l&apos;encyclopédie
          vivante du serveur le plus immersif de la communauté francophone.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {siteConfig.serverOpen ? (
            <Button href={`minecraft://${siteConfig.serverIp}`} variant="primary">
              Rejoindre le serveur
            </Button>
          ) : (
            <Button href="#ouverture" variant="primary">
              Ouverture prochaine
            </Button>
          )}
          <Button href="/wiki" variant="secondary">
            Explorer l&apos;encyclopédie
          </Button>
          {siteConfig.recruitmentOpen && (
            <Button href="/candidatures" variant="ghost">
              Rejoindre l&apos;équipe
            </Button>
          )}
          {siteConfig.discordInvite && (
            <Button href={siteConfig.discordInvite} variant="secondary">
              <MessageCircle className="h-4 w-4" />
              Discord
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4"
        >
          {[
            { label: "SCP confinés", value: "50+" },
            { label: "Factions", value: "8" },
            { label: "Grades Site-12", value: "70+" },
            { label: "Zones explorables", value: "10+" },
          ].map((stat) => (
            <div key={stat.label} className="hologram-border rounded px-6 py-4">
              <p className="font-mono text-2xl font-bold text-redlake-glow">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
