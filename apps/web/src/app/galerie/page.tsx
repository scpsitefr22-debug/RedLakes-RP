"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  faction?: string;
  type: string;
  date: string;
}

const filters = ["Tous", "scp", "evenement", "screenshot"];

function isImage(url: string) {
  return /\.(svg|png|jpe?g|webp|gif)$/i.test(url);
}

export default function GaleriePage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("Tous");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<GalleryItem[]>("/gallery")
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "Tous") return true;
    return item.type === filter;
  });

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length],
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const active = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ARCHIVES VISUELLES
        </p>
        <h1 className="text-4xl font-bold text-white">Galerie</h1>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded border px-4 py-1 font-mono text-xs capitalize transition-colors ${
              filter === f
                ? "border-redlake bg-redlake/20 text-redlake-glow"
                : "border-metal text-gray-500 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          Aucune image dans cette catégorie pour le moment.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group hologram-border overflow-hidden rounded-lg text-left"
            >
              <div className="relative flex aspect-video items-center justify-center bg-metal/20">
                {isImage(item.url) ? (
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-700 group-hover:text-redlake-glow" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="font-mono text-xs text-gray-600">
                  {item.faction} — {new Date(item.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-6 top-6 text-gray-400 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>

          {filtered.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-metal/50 bg-black/60 p-2 text-gray-400 hover:text-white"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-metal/50 bg-black/60 p-2 text-gray-400 hover:text-white"
                aria-label="Suivant"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="relative flex max-h-[80vh] w-full max-w-4xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isImage(active.url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.url}
                alt={active.title}
                className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-metal/20">
                <ImageIcon className="h-20 w-20 text-gray-700" />
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-white">{active.title}</h3>
            <p className="font-mono text-xs text-gray-500">
              {active.faction} — {new Date(active.date).toLocaleDateString("fr-FR")}
              {filtered.length > 1 && ` — ${lightboxIndex! + 1}/${filtered.length}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
