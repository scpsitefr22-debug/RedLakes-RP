"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X, FileText, Users, MapPin, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { searchAll, type SearchResult } from "@/lib/search";
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
  mtf: <Shield className="h-4 w-4 text-red-400" />,
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

interface ApiSearchHit {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  href: string;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    const local = searchAll(q);
    try {
      const apiResults = await apiFetch<ApiSearchHit[]>(`/search?q=${encodeURIComponent(q)}`);
      const merged = [
        ...apiResults.map((r) => ({
          id: r.id,
          title: r.title,
          type: r.type as SearchResult["type"],
          href: r.href,
          excerpt: r.excerpt,
        })),
        ...local.filter(
          (l) => !apiResults.some((a) => a.href === l.href)
        ),
      ];
      setResults(merged.slice(0, 20));
    } catch {
      setResults(local);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
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
            {query && results.length === 0 && (
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
                SCP • Factions • Lore • Événements • Elasticsearch
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
