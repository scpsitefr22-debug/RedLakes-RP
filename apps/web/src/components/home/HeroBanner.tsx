"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useSystemStatus, type AlertLevel } from "@/hooks/useSystemStatus";
import { apiFetch } from "@/lib/api";
import type { SCPClass } from "@/data/scp";

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

interface MonitoredScp {
  id: string;
  slug: string;
  number: string;
  name: string;
  class: SCPClass;
  threatLevel: number;
  description: string;
}

/** Couleur d'une classe d'objet, en valeur brute pour les styles inline. */
const CLASS_HEX: Record<SCPClass, string> = {
  Safe: "#4ade80",
  Euclid: "#facc15",
  Keter: "#f87171",
  Thaumiel: "#c084fc",
  Apollyon: "#fb923c",
};

/** Première phrase lisible d'une description (sans balisage markdown). */
function excerpt(text: string) {
  const plain = text.replace(/[#*_>`[\]]/g, "").replace(/\s+/g, " ").trim();
  return plain.length > 150 ? `${plain.slice(0, 150).trimEnd()}…` : plain;
}

/**
 * Moniteur de confinement : les vrais dossiers du wiki SCP défilent sur le
 * terminal de surveillance (numéro, classe, niveau de menace). Contenu RP
 * uniquement — la carte du serveur est un outil HRP réservé au staff.
 * Aucun statut de brèche n'est affiché : les brèches restent décidées par le staff.
 */
function ContainmentMonitor({ alert }: { alert: AlertLevel }) {
  const now = useClock();
  const reduce = useReducedMotion();
  const level = ALERT[alert];
  const [files, setFiles] = useState<MonitoredScp[]>([]);
  const [focus, setFocus] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    apiFetch<MonitoredScp[]>("/scp")
      .then((list) => {
        setFiles(list);
        // Chaque visite démarre sur un dossier différent.
        if (list.length) setFocus(Math.floor(Math.random() * list.length));
      })
      .catch(() => setFiles([]));
  }, []);

  useEffect(() => {
    if (files.length < 2 || reduce || paused) return;
    const id = setInterval(() => setFocus((i) => (i + 1) % files.length), 4200);
    return () => clearInterval(id);
  }, [files.length, reduce, paused]);

  const current = files.length ? files[focus % files.length] : null;
  const color = current ? CLASS_HEX[current.class] ?? "#e6eaf0" : "#e6eaf0";
  const threat = current ? Math.max(0, Math.min(5, current.threatLevel)) : 0;
  const keterCount = files.filter((f) => f.class === "Keter").length;
  const time = now
    ? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const step = (delta: number) =>
    setFocus((i) => (files.length ? (i + delta + files.length) % files.length : 0));

  return (
    <div
      className="hologram-border relative overflow-hidden p-4 sm:p-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="label-mono text-[10px] text-gray-400">
          <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-redlake-glow align-middle motion-reduce:animate-none" />
          Terminal de surveillance // Confinement
        </p>
        <p className="font-mono text-xs tabular-nums text-gray-300">{time}</p>
      </div>

      <div className="relative mt-4 aspect-[5/4] overflow-hidden border border-line bg-[#05070a]">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(230,234,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(230,234,240,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 70% 30%, ${color}26, transparent 65%), radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 3px)" }}
          aria-hidden
        />

        {current ? (
          <Link
            key={current.id}
            href={`/wiki/${current.slug}`}
            className="group absolute inset-0 flex flex-col justify-between p-5 sm:p-7 motion-safe:animate-[monitor-in_420ms_ease-out]"
          >
            <span
              className="font-display pointer-events-none absolute -right-2 -top-6 select-none text-[clamp(5rem,14vw,9rem)] font-extrabold leading-none text-transparent"
              style={{ WebkitTextStroke: `1px ${color}40` }}
              aria-hidden
            >
              {current.number.replace(/^SCP-/i, "")}
            </span>

            <div className="relative">
              <span
                className="label-mono inline-block border px-2 py-1 text-[10px]"
                style={{ color, borderColor: `${color}66`, background: `${color}14` }}
              >
                Classe {current.class}
              </span>
            </div>

            <div className="relative">
              <p className="label-mono text-[10px] text-gray-500">Dossier d&apos;objet</p>
              <p className="font-display text-[clamp(2.5rem,6vw,4rem)] font-extrabold uppercase leading-none text-white">
                {current.number}
              </p>
              <p className="font-display mt-1 text-xl font-bold uppercase tracking-wide text-gray-200">
                {current.name}
              </p>
              {current.description && (
                <p className="mt-3 line-clamp-2 max-w-md text-sm text-gray-400">{excerpt(current.description)}</p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <span className="label-mono text-[9px] text-gray-500">Menace</span>
                <span className="flex gap-1" aria-label={`Niveau de menace ${threat} sur 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2.5 w-6"
                      style={{ background: i < threat ? color : "rgba(230,234,240,0.1)" }}
                    />
                  ))}
                </span>
                <span className="label-mono ml-auto text-[9px] text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Ouvrir le dossier →
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="label-mono text-[10px] text-gray-500">Connexion aux archives…</p>
          </div>
        )}

        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-redlake-glow/60 shadow-[0_0_12px_2px_rgba(229,57,47,0.45)] motion-safe:animate-[hero-scan_5s_linear_infinite]" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={files.length < 2}
          className="label-mono border border-line px-2.5 py-1 text-[10px] text-gray-400 transition-colors hover:border-line-strong hover:text-white disabled:opacity-40"
          aria-label="Dossier précédent"
        >
          ←
        </button>
        <p className="label-mono text-[10px] tabular-nums text-gray-500">
          {files.length ? `${String((focus % files.length) + 1).padStart(2, "0")} / ${files.length}` : "— / —"}
        </p>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={files.length < 2}
          className="label-mono border border-line px-2.5 py-1 text-[10px] text-gray-400 transition-colors hover:border-line-strong hover:text-white disabled:opacity-40"
          aria-label="Dossier suivant"
        >
          →
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-x-5 gap-y-1 text-left">
        <div className="border-l-2 pl-3" style={{ borderColor: level.color }}>
          <dt className="label-mono text-[9px] text-gray-500">Alerte</dt>
          <dd className="font-display text-lg font-bold uppercase" style={{ color: level.color }}>
            {level.label}
          </dd>
        </div>
        <div className="border-l-2 border-line pl-3">
          <dt className="label-mono text-[9px] text-gray-500">Dossiers</dt>
          <dd className="font-display text-lg font-bold uppercase text-white">{files.length || "—"}</dd>
        </div>
        <div className="border-l-2 border-line pl-3">
          <dt className="label-mono text-[9px] text-gray-500">Classe Keter</dt>
          <dd className="font-display text-lg font-bold uppercase text-white">{files.length ? keterCount : "—"}</dd>
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
