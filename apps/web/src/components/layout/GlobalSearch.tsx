"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X, FileText, Users, MapPin, BookOpen, Shield, FileLock2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const typeIcons: Record<string, React.ReactNode> = {
  scp: <FileText className="h-4 w-4 text-redlake-glow" />,
  faction: <Shield className="h-4 w-4 text-redlake-glow" />,
  lore: <BookOpen className="h-4 w-4 text-redlake-glow" />,
  event: <FileText className="h-4 w-4 text-yellow-400" />,
  news: <FileText className="h-4 w-4 text-blue-400" />,
  location: <MapPin className="h-4 w-4 text-green-400" />,
  character: <Users className="h-4 w-4 text-purple-400" />,
  department: <Shield className="h-4 w-4 text-gray-400" />,
  document: <FileLock2 className="h-4 w-4 text-red-400" />,
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  href: string;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setError(false);
      return;
    }

    try {
      // Recherche live cote API (filtree par habilitation departement du
      // demandeur cote serveur) — plus de repli sur un index statique
      // fige : ce repli ne reflétait jamais les modifications faites via
      // le CMS et, plus grave, n'avait aucune notion de restriction par
      // departement (un contenu classifie pouvait fuiter dans les
      // resultats de recherche d'un visiteur non autorise).
      const apiResults = await apiFetch<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`);
      setResults(apiResults.slice(0, 20));
      setError(false);
    } catch {
      setResults([]);
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 pt-[15vh] backdrop-blur-sm">
      <div className="w-full max-w-2xl px-4">
        <div className="hologram-border overflow-hidden rounded-lg bg-black">
          <div className="flex items-center gap-3 border-b border-redlake/20 px-4 py-3">
            <Search className="h-5 w-5 text-redlake-glow" />
            <input
              autoFocus
              type="text"
              placeholder="Rechercher SCP, factions, lore, joueurs..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-gray-600"
            />
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {error && (
              <p className="px-4 py-8 text-center font-mono text-sm text-red-400">
                Recherche indisponible — API hors ligne.
              </p>
            )}
            {!error && query && results.length === 0 && (
              <p className="px-4 py-8 text-center font-mono text-sm text-gray-500">
                Aucun résultat pour &quot;{query}&quot;
              </p>
            )}
            {results.map((r) => (
              <Link
                key={`${r.type}-${r.id}`}
                href={r.href}
                onClick={onClose}
                className="flex items-start gap-3 rounded px-4 py-3 transition-colors hover:bg-redlake/10"
              >
                {typeIcons[r.type] ?? <FileText className="h-4 w-4" />}
                <div>
                  <p className="text-sm font-medium text-white">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.excerpt}</p>
                </div>
              </Link>
            ))}
            {!query && (
              <p className="px-4 py-8 text-center font-mono text-xs text-gray-600">
                SCP • Factions • Lore • Personnages • Événements • Documents classifiés
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
