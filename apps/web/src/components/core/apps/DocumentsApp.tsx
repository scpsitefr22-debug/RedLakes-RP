"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Folder, FileText, ChevronRight, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";

interface DocItem {
  id: string;
  title: string;
  content: string;
  href: string;
}

interface FolderDef {
  id: string;
  label: string;
  items: DocItem[];
}

/**
 * Explorateur d'archives classifiées du CORE — mêmes sources que la page
 * publique /archives (lore/événements/SCP avec restrictedDepartmentIds
 * réel, filtré côté API selon le département du joueur), réorganisées en
 * dossiers par catégorie plutôt qu'en liste plate.
 */
export function DocumentsApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [folders, setFolders] = useState<FolderDef[] | null>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [openDoc, setOpenDoc] = useState<DocItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const auth = await apiFetch<{ authenticated: boolean }>("/auth/me");
        setAuthenticated(auth.authenticated);
        if (!auth.authenticated) return;

        const [articles, events, scps] = await Promise.all([
          apiFetch<{ id: string; slug: string; title: string; content: string; restrictedDepartmentIds: string[] }[]>(
            "/lore",
          ),
          apiFetch<{ id: string; slug: string; title: string; description: string; restrictedDepartmentIds: string[] }[]>(
            "/events",
          ),
          apiFetch<{ id: string; slug: string; number: string; description: string; restrictedDepartmentIds: string[] }[]>(
            "/scp",
          ),
        ]);

        setFolders([
          {
            id: "lore",
            label: "Lore classifié",
            items: articles
              .filter((a) => a.restrictedDepartmentIds.length > 0)
              .map((a) => ({ id: a.id, title: a.title, content: a.content, href: `/lore/${a.slug}` })),
          },
          {
            id: "evenements",
            label: "Événements classifiés",
            items: events
              .filter((e) => e.restrictedDepartmentIds.length > 0)
              .map((e) => ({ id: e.id, title: e.title, content: e.description, href: `/evenements/${e.slug}` })),
          },
          {
            id: "scp",
            label: "Dossiers SCP classifiés",
            items: scps
              .filter((s) => s.restrictedDepartmentIds.length > 0)
              .map((s) => ({ id: s.id, title: s.number, content: s.description, href: `/wiki/${s.slug}` })),
          },
        ]);
      } catch {
        /* API indisponible — dossiers vides plutôt que figés */
      }
    })();
  }, []);

  const totalCount = useMemo(
    () => folders?.reduce((n, f) => n + f.items.length, 0) ?? 0,
    [folders],
  );

  if (authenticated === null || folders === null) {
    return <p className="text-sm text-gray-500">Chargement…</p>;
  }

  if (!authenticated) {
    return (
      <p className="text-sm text-gray-500">
        Session requise. <Link href="/connexion" className="text-redlake-glow hover:underline">Se connecter</Link>
      </p>
    );
  }

  // Vue document
  if (openDoc) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenDoc(null)}
          className="mb-3 flex items-center gap-1 font-mono text-[10px] text-gray-500 hover:text-white"
        >
          ← Retour au dossier
        </button>
        <div className="mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-green-400" />
          <h3 className="font-bold text-white">{openDoc.title}</h3>
        </div>
        <DiscordMarkdown text={openDoc.content} className="mb-4 text-sm text-gray-400" />
        <Link href={openDoc.href} className="font-mono text-xs text-redlake-glow hover:underline">
          Ouvrir la fiche complète →
        </Link>
      </div>
    );
  }

  const active = folders.find((f) => f.id === openFolder);

  // Vue contenu d'un dossier
  if (active) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenFolder(null)}
          className="mb-3 flex items-center gap-1 font-mono text-[10px] text-gray-500 hover:text-white"
        >
          ← ARCHIVES
        </button>
        <h3 className="mb-3 font-bold text-white">{active.label}</h3>
        {active.items.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-600">Aucun document accessible ici.</p>
        ) : (
          <ul className="space-y-1">
            {active.items.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setOpenDoc(doc)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-300 hover:bg-white/5"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                  <span className="truncate">{doc.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Vue racine — liste des dossiers
  return (
    <div>
      <p className="mb-4 font-mono text-[10px] text-gray-600">
        {totalCount} document(s) classifié(s) accessible(s) à votre département.
      </p>
      <ul className="space-y-1">
        {folders.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setOpenFolder(f.id)}
              disabled={f.items.length === 0}
              className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-gray-300 hover:bg-white/5 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Folder className="h-4 w-4 shrink-0 text-yellow-500/80" />
              <span className="flex-1">{f.label}</span>
              <span className="font-mono text-[10px] text-gray-600">{f.items.length}</span>
              {f.items.length > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-600" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
