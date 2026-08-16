"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Unlock, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ClassifiedItem {
  id: string;
  title: string;
  content: string;
  href: string;
}

export function ArchivesClassified() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [cmsItems, setCmsItems] = useState<ClassifiedItem[]>([]);
  const [liveItems, setLiveItems] = useState<ClassifiedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const auth = await apiFetch<{ authenticated: boolean }>("/auth/me");
        setAuthenticated(auth.authenticated);
        if (auth.authenticated) {
          const articles = await apiFetch<
            {
              id: string;
              slug: string;
              title: string;
              content: string;
              restrictedDepartmentIds: string[];
            }[]
          >("/lore");
          setCmsItems(
            articles
              .filter((a) => a.restrictedDepartmentIds.length > 0)
              .map((a) => ({
                id: a.id,
                title: a.title,
                content: a.content,
                href: `/lore/${a.slug}`,
              })),
          );
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [events, scps] = await Promise.all([
          apiFetch<
            { id: string; slug: string; title: string; description: string; restrictedDepartmentIds: string[] }[]
          >("/events"),
          apiFetch<
            { id: string; slug: string; number: string; description: string; restrictedDepartmentIds: string[] }[]
          >("/scp"),
        ]);
        setLiveItems([
          ...events
            .filter((e) => e.restrictedDepartmentIds.length > 0)
            .map((e) => ({
              id: e.id,
              title: e.title,
              content: e.description,
              href: `/evenements/${e.slug}`,
            })),
          ...scps
            .filter((s) => s.restrictedDepartmentIds.length > 0)
            .map((s) => ({
              id: s.id,
              title: s.number,
              content: s.description,
              href: `/wiki/${s.slug}`,
            })),
        ]);
      } catch {
        /* API indisponible — section vide plutôt que figée */
      }
    })();
  }, []);

  const allItems = useMemo(
    () => [...cmsItems, ...liveItems],
    [cmsItems, liveItems],
  );

  if (loading) {
    return (
      <p className="font-mono text-gray-500">Vérification des accréditations…</p>
    );
  }

  if (!authenticated) {
    return (
      <p className="text-gray-500">
        Session requise.{" "}
        <Link href="/connexion" className="text-redlake-glow hover:underline">
          Se connecter
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="hologram-border rounded-lg p-6">
        <p className="font-mono text-sm text-gray-500">
          Dossiers classifiés accessibles à votre département.
        </p>
      </div>

      {allItems.length === 0 ? (
        <p className="text-gray-500">
          Aucun dossier classifié accessible à votre département pour le moment.
        </p>
      ) : (
        <div className="space-y-4">
          {allItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-redlake/30 bg-redlake/5 p-6 transition-all"
            >
              <div className="mb-3 flex items-center gap-2">
                <Unlock className="h-4 w-4 text-green-400" />
                <h3 className="font-bold text-white">{item.title}</h3>
              </div>
              <p className="line-clamp-4 text-sm text-gray-400">{item.content}</p>
              <Link
                href={item.href}
                className="mt-3 inline-block font-mono text-xs text-redlake-glow hover:underline"
              >
                Consulter le dossier complet →
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 font-mono text-xs text-gray-600">
        <FileText className="h-4 w-4" />
        {allItems.length} document(s) classifié(s) accessible(s)
      </div>
    </div>
  );
}
