"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
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

export default function GaleriePage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState("Tous");

  useEffect(() => {
    apiFetch<GalleryItem[]>("/gallery")
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "Tous") return true;
    return item.type === filter;
  });

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div key={item.id} className="group hologram-border overflow-hidden rounded-lg">
            <div className="relative flex aspect-video items-center justify-center bg-metal/20">
              {item.url.endsWith(".svg") || item.url.endsWith(".png") || item.url.endsWith(".jpg") ? (
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100"
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
          </div>
        ))}
      </div>
    </div>
  );
}
