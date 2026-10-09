"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Copy, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useSystemStatus, type AlertLevel } from "@/hooks/useSystemStatus";

const ALERT: Record<AlertLevel, { label: string; color: string }> = {
  NORMAL: { label: "Normal", color: "#34d399" },
  VIGILANCE: { label: "Vigilance", color: "#fcd34d" },
  ALERTE: { label: "Alerte", color: "#fb923c" },
  CRISE: { label: "Crise", color: "#ef4444" },
};

const STATS = [
  { value: "50+", label: "Anomalies confinées" },
  { value: "8", label: "Factions jouables" },
  { value: "70+", label: "Grades au Site-12" },
  { value: "10+", label: "Zones à explorer" },
];

/** Heure du site, rafraîchie chaque seconde (affichée seulement côté navigateur). */
function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function ServerAddress() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.serverIp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* presse-papiers refusé : l'adresse reste lisible et sélectionnable */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="group flex items-center gap-3 border border-line bg-black/40 px-4 py-3 text-left transition-colors hover:border-line-strong"
      title="Copier l'adresse du serveur"
    >
      <span>
        <span className="label-mono block text-[10px] text-gray-500">Adresse du serveur</span>
        <span className="mt-0.5 block select-all font-mono text-sm text-white">{siteConfig.serverIp}</span>
      </span>
      <span className="ml-2 flex h-8 w-8 items-center justify-center border border-line text-gray-400 group-hover:text-white">
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </span>
    </button>
  );
}

/**
 * Moniteur de confinement : plan schématique du Site-12 vu par une caméra de
 * sécurité, balayage radar, heure et niveau d'alerte réels.
 */
function ContainmentMonitor({ alert }: { alert: AlertLevel }) {
  const now = useClock();
  const reduce = useReducedMotion();
  const level = ALERT[alert];
  const time = now
    ? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  return (
    <div className="hologram-border relative overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="label-mono text-[10px] text-gray-400">
          <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-redlake-glow align-middle motion-reduce:animate-none" />
          CAM-07 // Plan du Site-12
        </p>
        <p className="font-mono text-xs tabular-nums text-gray-300">{time}</p>
      </div>

      <div className="relative mt-4 aspect-[4/3] overflow-hidden border border-line bg-[#05080b]">
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <pattern id="hero-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="rgba(150,170,200,0.08)" strokeWidth="1" />
            </pattern>
            <radialGradient id="hero-sweep" gradientUnits="userSpaceOnUse" cx="200" cy="150" r="175">
              <stop offset="0" stopColor="rgba(229,57,47,0.35)" />
              <stop offset="1" stopColor="rgba(229,57,47,0)" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="url(#hero-grid)" />

          {/* Ailes du site */}
          <g fill="rgba(18,24,33,0.85)" stroke="rgba(150,170,200,0.35)" strokeWidth="1">
            <rect x="30" y="30" width="120" height="80" />
            <rect x="250" y="30" width="120" height="80" />
            <rect x="30" y="190" width="120" height="80" />
            <rect x="250" y="190" width="120" height="80" />
            <rect x="160" y="120" width="80" height="60" />
          </g>
          {/* Couloirs */}
          <g stroke="rgba(150,170,200,0.25)" strokeWidth="6" strokeLinecap="square">
            <line x1="150" y1="70" x2="250" y2="70" />
            <line x1="150" y1="230" x2="250" y2="230" />
            <line x1="200" y1="110" x2="200" y2="120" />
            <line x1="200" y1="180" x2="200" y2="190" />
            <line x1="90" y1="110" x2="90" y2="190" />
            <line x1="310" y1="110" x2="310" y2="190" />
          </g>
          {/* Cellule Keter au centre */}
          <rect x="182" y="137" width="36" height="26" fill="rgba(229,57,47,0.18)" stroke="#e5392f" strokeWidth="1.5" />
          <circle cx="200" cy="150" r="3" fill="#e5392f" />

          <g fontFamily="var(--font-code), monospace" fontSize="9" letterSpacing="1.5" fill="rgba(200,210,222,0.75)">
            <text x="38" y="46">AILE A — SAFE</text>
            <text x="258" y="46">AILE B — EUCLID</text>
            <text x="38" y="206">ARMURERIE</text>
            <text x="258" y="206">LABORATOIRES</text>
            <text x="168" y="133" fill="#e5392f">KETER</text>
          </g>

          {/* Balayage radar autour de la cellule centrale */}
          {!reduce && (
            <g className="animate-[hero-sweep_6s_linear_infinite]" style={{ transformOrigin: "200px 150px", transformBox: "view-box" }}>
              <path d="M200 150 L370 110 A175 175 0 0 1 370 190 Z" fill="url(#hero-sweep)" opacity="0.9" />
            </g>
          )}
          <g fill="none" stroke="rgba(229,57,47,0.25)">
            <circle cx="200" cy="150" r="60" />
            <circle cx="200" cy="150" r="115" strokeDasharray="2 6" />
          </g>
        </svg>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-redlake-glow/60 shadow-[0_0_12px_2px_rgba(229,57,47,0.45)] motion-safe:animate-[hero-scan_5s_linear_infinite]" />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-left">
        <div className="border-l-2 pl-3" style={{ borderColor: level.color }}>
          <dt className="label-mono text-[9px] text-gray-500">Alerte</dt>
          <dd className="font-display text-lg font-bold uppercase" style={{ color: level.color }}>
            {level.label}
          </dd>
        </div>
        <div className="border-l-2 border-line pl-3">
          <dt className="label-mono text-[9px] text-gray-500">Confinement</dt>
          <dd className="font-display text-lg font-bold uppercase text-white">Stable</dd>
        </div>
        <div className="border-l-2 border-line pl-3">
          <dt className="label-mono text-[9px] text-gray-500">Réseau</dt>
          <dd className="font-display text-lg font-bold uppercase text-white">Chiffré</dd>
        </div>
      </dl>
    </div>
  );
}

export function HeroBanner() {
  const { serverOpen, recruitmentOpen, alertLevel } = useSystemStatus();

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_75%_40%,rgba(229,57,47,0.12),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="label-mono flex items-center gap-3 text-redlake-glow">
            <span className="h-px w-10 bg-redlake-glow" aria-hidden />
            Fondation SCP — Dossier 12-A
          </p>

          <h1 className="font-display mt-6 font-extrabold uppercase leading-[0.82] tracking-[0.01em] text-white">
            <span className="block text-[clamp(4.5rem,13vw,10.5rem)]">Redlakes</span>
            <span
              className="block text-[clamp(3rem,8.5vw,6.75rem)] text-transparent"
              style={{ WebkitTextStroke: "2px #e5392f" }}
            >
              Site-12
            </span>
          </h1>

          <p className="font-display mt-6 text-2xl font-semibold uppercase tracking-[0.18em] text-gray-300">
            Sécuriser · Contenir · Protéger
          </p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-400">
            SCP Roleplay, DarkRP et univers original sur Minecraft Java. Prends un poste au Site-12,
            gravis la hiérarchie, et garde ce qui ne doit jamais sortir.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {serverOpen ? (
              <a
                href={`minecraft://${siteConfig.serverIp}`}
                className="font-display group flex items-center gap-2 bg-redlake-glow px-7 py-4 text-lg font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff4a3f]"
              >
                Rejoindre le serveur
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            ) : (
              <a
                href="#ouverture"
                className="font-display group flex items-center gap-2 bg-redlake-glow px-7 py-4 text-lg font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff4a3f]"
              >
                Ouverture prochaine
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            )}
            <Link
              href="/wiki"
              className="font-display border border-line-strong px-7 py-4 text-lg font-bold uppercase tracking-[0.12em] text-gray-200 transition-colors hover:border-white hover:text-white"
            >
              Explorer l&apos;encyclopédie
            </Link>
            {siteConfig.discordInvite && (
              <a
                href={siteConfig.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[60px] w-[60px] items-center justify-center border border-[#5865F2]/50 bg-[#5865F2]/10 text-[#c3c8ff] transition-colors hover:border-[#5865F2] hover:text-white"
                aria-label={siteConfig.discordLabel}
                title={siteConfig.discordLabel}
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <ServerAddress />
            {recruitmentOpen && (
              <Link href="/candidatures" className="label-mono text-gray-400 transition-colors hover:text-white">
                Recrutement ouvert — postuler →
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <ContainmentMonitor alert={alertLevel} />
        </motion.div>
      </div>

      <div className="hazard-stripes h-1.5 opacity-90" aria-hidden />
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 border-line px-6 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`py-7 ${i > 0 ? "md:border-l md:border-line md:pl-8" : ""} ${i % 2 === 1 ? "border-l border-line pl-6 md:pl-8" : ""}`}
          >
            <p className="font-display text-5xl font-extrabold leading-none text-white">{stat.value}</p>
            <p className="label-mono mt-2 text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
