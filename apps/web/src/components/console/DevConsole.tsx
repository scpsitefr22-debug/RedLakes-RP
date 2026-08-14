"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Database,
  Globe,
  LayoutDashboard,
  RefreshCw,
  Server,
  Shield,
  Terminal,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { apiFetch, checkApiAvailable } from "@/lib/api";
import { cn } from "@/lib/utils";

interface HealthPayload {
  status: "ok" | "degraded";
  service: string;
  environment: string;
  timestamp: string;
  checks: {
    database: "up" | "down";
    databaseLatencyMs: number | null;
  };
}

type ServiceState = "up" | "down" | "checking";

interface ServiceCard {
  id: string;
  label: string;
  description: string;
  state: ServiceState;
  detail?: string;
  href?: string;
  icon: typeof Server;
}

export function DevConsole() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [siteUp, setSiteUp] = useState(true);
  const [checking, setChecking] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const h = await apiFetch<HealthPayload>("/health");
      setHealth(h);
    } catch {
      setHealth(null);
    }
    const apiOk = await checkApiAvailable();
    setSiteUp(apiOk);
    setLastCheck(new Date());
    setChecking(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  const services: ServiceCard[] = [
    {
      id: "site",
      label: "Site Next.js",
      description: "Interface publique & intranet",
      state: siteUp ? "up" : "down",
      detail: "localhost:3000",
      href: "/",
      icon: Globe,
    },
    {
      id: "api",
      label: "API NestJS",
      description: "Backend plateforme REDLAKES",
      state: health ? (health.status === "ok" ? "up" : "down") : "down",
      detail: health?.service ?? "non joignable",
      href: "/api/health",
      icon: Server,
    },
    {
      id: "db",
      label: "PostgreSQL",
      description: "Base de donnees principale",
      state: health?.checks.database === "up" ? "up" : health ? "down" : "checking",
      detail:
        health?.checks.database === "up"
          ? `${health.checks.databaseLatencyMs ?? "?"} ms`
          : "port 5432",
      icon: Database,
    },
  ];

  const allUp = services.every((s) => s.state === "up");

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="hologram-border rounded-xl p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs tracking-[0.3em] text-redlake-glow">
              REDLAKES RP — CONSOLE DE CONTROLE
            </p>
            <h1 className="text-3xl font-bold text-white">
              Plateforme Site-12
            </h1>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              Panneau de supervision locale. Etat des services, raccourcis
              metiers et sante de l&apos;ecosysteme RP.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={checking}
            className="flex items-center gap-2 rounded border border-metal bg-black/40 px-4 py-2 font-mono text-xs text-gray-400 transition-colors hover:border-redlake/50 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", checking && "animate-spin")} />
            Actualiser
          </button>
        </div>

        <div
          className={cn(
            "mt-6 flex items-center gap-3 rounded-lg border px-4 py-3",
            allUp
              ? "border-green-400/30 bg-green-400/5"
              : "border-yellow-400/30 bg-yellow-400/5",
          )}
        >
          {allUp ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          )}
          <div>
            <p className="font-mono text-sm text-white">
              {allUp
                ? "Tous les services critiques sont operationnels"
                : "Plateforme partielle — verifiez les services en erreur"}
            </p>
            {lastCheck && (
              <p className="font-mono text-[10px] text-gray-600">
                Derniere verification :{" "}
                {lastCheck.toLocaleTimeString("fr-FR")}
                {health?.environment && ` — env ${health.environment}`}
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {services.map((s) => (
          <ServiceStatusCard key={s.id} service={s} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="hologram-border rounded-xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
            <LayoutDashboard className="h-5 w-5 text-redlake-glow" />
            Acces rapides
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickLink href="/" label="Accueil public" />
            <QuickLink href="/connexion" label="Connexion agent" />
            <QuickLink href="/dashboard" label="Dossier agent" />
            <QuickLink href="/intranet" label="Intranet Site-12" />
            <QuickLink href="/staff" label="Tableau staff" />
            <QuickLink href="/candidatures" label="Candidatures" />
            <QuickLink href="/transmissions" label="Transmissions" />
            <QuickLink href="/joueurs" label="Registre personnel" />
          </div>
        </div>

        <div className="hologram-border rounded-xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
            <Terminal className="h-5 w-5 text-redlake-glow" />
            Commandes developpeur
          </h2>
          <ul className="space-y-2 font-mono text-xs text-gray-500">
            <CmdLine cmd="npm run dev" desc="Lance site + API (+ console)" />
            <CmdLine cmd="npm run dev:full" desc="+ Bot Discord" />
            <CmdLine cmd="npm run hub" desc="Centre de commandement complet" />
            <CmdLine cmd="npm run db:up" desc="Docker Postgres + Elasticsearch" />
            <CmdLine cmd="npm run stop" desc="Arreter site & API" />
          </ul>
        </div>
      </section>

      <section className="hologram-border rounded-xl p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
          <Activity className="h-5 w-5 text-redlake-glow" />
          Modules plateforme
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ModulePill icon={Shield} label="Habilitations" active />
          <ModulePill icon={Users} label="Rapports RP" active />
          <ModulePill icon={Users} label="Candidatures" active />
          <ModulePill icon={Activity} label="Audit & notifications" active />
        </div>
      </section>
    </div>
  );
}

function ServiceStatusCard({ service }: { service: ServiceCard }) {
  const Icon = service.icon;
  const stateColors = {
    up: "border-green-400/30 text-green-400",
    down: "border-red-400/30 text-red-400",
    checking: "border-yellow-400/30 text-yellow-400",
  };
  const StateIcon =
    service.state === "up"
      ? CheckCircle2
      : service.state === "down"
        ? XCircle
        : AlertTriangle;

  const inner = (
    <>
      <div className="mb-3 flex items-start justify-between">
        <Icon className="h-5 w-5 text-redlake-glow" />
        <span
          className={cn(
            "flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase",
            stateColors[service.state],
          )}
        >
          <StateIcon className="h-3 w-3" />
          {service.state === "up" ? "online" : service.state === "down" ? "offline" : "..."}
        </span>
      </div>
      <p className="font-bold text-white">{service.label}</p>
      <p className="mt-1 text-xs text-gray-600">{service.description}</p>
      {service.detail && (
        <p className="mt-2 font-mono text-[10px] text-gray-500">{service.detail}</p>
      )}
    </>
  );

  if (service.href) {
    return (
      <Link
        href={service.href}
        target={service.href.startsWith("http") ? "_blank" : undefined}
        className="block rounded-xl border border-metal/40 bg-black/30 p-5 transition-colors hover:border-redlake/30 hover:bg-redlake/5"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-metal/40 bg-black/30 p-5">
      {inner}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded border border-metal/40 bg-black/20 px-3 py-2.5 font-mono text-xs text-gray-400 transition-colors hover:border-redlake/40 hover:text-white"
    >
      {label}
      <ExternalLink className="h-3 w-3 opacity-40" />
    </Link>
  );
}

function CmdLine({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <li className="flex flex-wrap items-baseline gap-2 rounded bg-black/30 px-3 py-2">
      <code className="text-redlake-glow">{cmd}</code>
      <span className="text-gray-600">— {desc}</span>
    </li>
  );
}

function ModulePill({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Shield;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded border px-3 py-2 font-mono text-[10px]",
        active
          ? "border-green-400/20 text-green-400/90"
          : "border-metal/30 text-gray-600",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}
