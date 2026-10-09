"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useSystemStatus, type AlertLevel } from "@/hooks/useSystemStatus";
import { apiFetch } from "@/lib/api";

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

interface MapPoint {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
}

/** Couleur d'un lieu selon son type — mêmes familles que la carte interactive (/carte). */
const POINT_COLORS: Record<string, string> = {
  site: "#e5392f",
  surface: "#60a5fa",
  ville: "#4ade80",
  egouts: "#c084fc",
  criminel: "#fb923c",
  labo: "#facc15",
  scp: "#f87171",
  portail: "#f472b6",
  ennemi: "#9ca3af",
  village: "#a3e635",
  nature: "#34d399",
  incident: "#ef4444",
  ferme: "#ca8a04",
};

/**
 * Moniteur de confinement : la vraie carte de REDLAKES (celle de /carte) vue
 * par une caméra de sécurité. Les lieux sont ceux de la carte interactive, à
 * leur place exacte ; la caméra cible chacun à tour de rôle.
 */
function ContainmentMonitor({ alert }: { alert: AlertLevel }) {
  const now = useClock();
  const reduce = useReducedMotion();
  const level = ALERT[alert];
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    apiFetch<MapPoint[]>("/map")
      .then(setPoints)
      .catch(() => setPoints([]));
  }, []);

  useEffect(() => {
    if (points.length < 2 || reduce) return;
    const id = setInterval(() => setFocus((i) => (i + 1) % points.length), 2800);
    return () => clearInterval(id);
  }, [points.length, reduce]);

  const target = points.length ? points[focus % points.length] : null;
  const hub = points.find((p) => p.type === "site") ?? { x: 50, y: 50 };
  const time = now
    ? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  return (
    <div className="hologram-border relative overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="label-mono text-[10px] text-gray-400">
          <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-redlake-glow align-middle motion-reduce:animate-none" />
          CAM-07 // Carte de Redlakes
        </p>
        <p className="font-mono text-xs tabular-nums text-gray-300">{time}</p>
      </div>

      <Link
        href="/carte"
        className="group relative mt-4 block aspect-[1126/923] overflow-hidden border border-line bg-black"
        aria-label="Ouvrir la carte interactive"
      >
        {/* La carte de base, passée en « image de caméra » : désaturée, assombrie, grain. */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-[filter] duration-500 group-hover:saturate-100"
          style={{
            backgroundImage: "url(/carte/redlakes-map.png)",
            filter: "saturate(0.45) brightness(0.72) contrast(1.08)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(rgba(10,20,30,0.25), rgba(10,20,30,0.25)), radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 3px)" }}
          aria-hidden
        />

        {/* Balayage radar centré sur le complexe du Site-12. */}
        {!reduce && (
          <span
            className="pointer-events-none absolute aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
            aria-hidden
          >
            <span
              className="absolute inset-0 animate-[hero-sweep_6s_linear_infinite] rounded-full"
              style={{ background: "conic-gradient(from 0deg, rgba(229,57,47,0.32), rgba(229,57,47,0) 16%, transparent 100%)" }}
            />
          </span>
        )}

        {points.map((p) => {
          const color = POINT_COLORS[p.type] ?? "#e6eaf0";
          const isTarget = target?.id === p.id;
          return (
            <span
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={p.name}
            >
              <span
                className="block h-2.5 w-2.5 rounded-full ring-2 ring-black/70"
                style={{ background: color, boxShadow: `0 0 10px ${color}` }}
              />
              {isTarget && (
                <>
                  <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2" aria-hidden>
                    <span className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-white" />
                    <span className="absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-white" />
                    <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-white" />
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-white" />
                  </span>
                  <span className="label-mono absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 px-1.5 py-0.5 text-[9px] text-white">
                    {p.name}
                  </span>
                </>
              )}
            </span>
          );
        })}

        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-redlake-glow/60 shadow-[0_0_12px_2px_rgba(229,57,47,0.45)] motion-safe:animate-[hero-scan_5s_linear_infinite]" />
        <span className="label-mono absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-[9px] text-gray-300 opacity-0 transition-opacity group-hover:opacity-100">
          Ouvrir la carte →
        </span>
      </Link>

      <dl className="mt-4 grid grid-cols-[auto_auto_1fr] gap-x-5 gap-y-1 text-left">
        <div className="border-l-2 pl-3" style={{ borderColor: level.color }}>
          <dt className="label-mono text-[9px] text-gray-500">Alerte</dt>
          <dd className="font-display text-lg font-bold uppercase" style={{ color: level.color }}>
            {level.label}
          </dd>
        </div>
        <div className="border-l-2 border-line pl-3">
          <dt className="label-mono text-[9px] text-gray-500">Lieux suivis</dt>
          <dd className="font-display text-lg font-bold uppercase text-white">{points.length || "—"}</dd>
        </div>
        <div className="min-w-0 border-l-2 border-line pl-3">
          <dt className="label-mono text-[9px] text-gray-500">Cible caméra</dt>
          <dd className="font-display truncate text-lg font-bold uppercase text-white">{target?.name ?? "—"}</dd>
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

          {recruitmentOpen && (
            <Link
              href="/candidatures"
              className="label-mono mt-6 inline-block text-gray-400 transition-colors hover:text-white"
            >
              Recrutement ouvert — postuler →
            </Link>
          )}
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
