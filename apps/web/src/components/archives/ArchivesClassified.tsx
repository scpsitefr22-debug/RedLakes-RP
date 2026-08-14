"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lock, Unlock, FileText } from "lucide-react";
import { CLEARANCE_LABELS, type ClearanceLevel } from "@/lib/clearance";
import { loreSections, gameEvents } from "@/data/lore";
import { scpObjects } from "@/data/scp";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ClassifiedItem {
  id: string;
  title: string;
  content: string;
  clearance: number;
  href?: string;
}

export function ArchivesClassified() {
  const [clearance, setClearance] = useState<ClearanceLevel | null>(null);
  const [cmsItems, setCmsItems] = useState<ClassifiedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const auth = await apiFetch<{ authenticated: boolean }>("/auth/me");
        if (auth.authenticated) {
          const player = await apiFetch<{ clearance: number }>("/players/me");
          const level = Math.min(
            Math.max(Math.round(player.clearance), 1),
            5,
          ) as ClearanceLevel;
          setClearance(level);

          const articles = await apiFetch<
            {
              id: string;
              slug: string;
              title: string;
              content: string;
              clearance: number;
            }[]
          >(`/lore?clearance=${level}`);
          setCmsItems(
            articles
              .filter((a) => a.clearance >= 3)
              .map((a) => ({
                id: a.id,
                title: a.title,
                content: a.content,
                clearance: a.clearance,
                href: `/lore/${a.slug}`,
              })),
          );
        }
      } catch {
        /* connexion requise — middleware redirige */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const staticItems = useMemo<ClassifiedItem[]>(() => {
    const lore = loreSections
      .filter((l) => l.clearance >= 3)
      .map((l) => ({
        id: l.id,
        title: l.title,
        content: l.content,
        clearance: l.clearance,
        href: `/lore/${l.id}`,
      }));
    const events = gameEvents
      .filter((e) => e.clearance >= 3)
      .map((e) => ({
        id: e.id,
        title: e.title,
        content: e.description,
        clearance: e.clearance,
      }));
    const scps = scpObjects
      .filter((s) => s.clearance >= 4)
      .map((s) => ({
        id: s.number,
        title: s.number,
        content: s.description,
        clearance: s.clearance,
      }));
    return [...lore, ...events, ...scps];
  }, []);

  const allItems = useMemo(() => {
    const cmsSlugs = new Set(cmsItems.map((c) => c.href));
    const dedupedStatic = staticItems.filter(
      (s) => !cmsSlugs.has(s.href),
    );
    return [...cmsItems, ...dedupedStatic];
  }, [cmsItems, staticItems]);

  if (loading) {
    return (
      <p className="font-mono text-gray-500">Vérification de l&apos;habilitation…</p>
    );
  }

  if (clearance === null) {
    return (
      <p className="text-gray-500">
        Session requise.{" "}
        <Link href="/connexion" className="text-redlake-glow hover:underline">
          Se connecter
        </Link>
      </p>
    );
  }

  const accessibleCount = allItems.filter((i) => clearance >= i.clearance).length;

  return (
    <div className="space-y-8">
      <div className="hologram-border rounded-lg p-6">
        <p className="mb-2 font-mono text-sm text-gray-500">
          Habilitation dérivée de votre grade :
        </p>
        <p className="font-mono text-lg font-bold text-redlake-glow">
          Niveau {clearance} — {CLEARANCE_LABELS[clearance]}
        </p>
        <p className="mt-2 font-mono text-xs text-gray-600">
          Les documents au-dessus de votre niveau restent expurgés.
        </p>
      </div>

      <div className="space-y-4">
        {allItems.map((item) => {
          const accessible = clearance >= item.clearance;
          return (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border p-6 transition-all",
                accessible
                  ? "border-redlake/30 bg-redlake/5"
                  : "border-metal/30 bg-metal/10 opacity-60",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {accessible ? (
                    <Unlock className="h-4 w-4 text-green-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-red-400" />
                  )}
                  <h3 className="font-bold text-white">
                    {accessible ? item.title : "████████ — ACCÈS REFUSÉ"}
                  </h3>
                </div>
                <span className="font-mono text-xs text-gray-600">
                  Niv. {item.clearance}
                </span>
              </div>
              {accessible ? (
                <>
                  <p className="line-clamp-4 text-sm text-gray-400">{item.content}</p>
                  {item.href && (
                    <Link
                      href={item.href}
                      className="mt-3 inline-block font-mono text-xs text-redlake-glow hover:underline"
                    >
                      Consulter le dossier complet →
                    </Link>
                  )}
                </>
              ) : (
                <p className="font-mono text-sm text-red-400/60">
                  [DONNÉES SUPPRIMÉES] Habilitation insuffisante.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-gray-600">
        <FileText className="h-4 w-4" />
        {accessibleCount} / {allItems.length} documents accessibles
      </div>
    </div>
  );
}
