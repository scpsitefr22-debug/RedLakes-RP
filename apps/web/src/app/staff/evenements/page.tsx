"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, Zap } from "lucide-react";

interface StaffGameEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  type: string;
}

export default function StaffEvenementsPage() {
  const [events, setEvents] = useState<StaffGameEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffGameEvent[]>("/events/cms")
      .then(setEvents)
      .catch(() => setError("Impossible de charger les événements — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES ÉVÉNEMENTS — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Événements</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les archives d&apos;événements.
          </p>
        </div>
        <Link
          href="/staff/evenements/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouvel événement
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && events.length === 0 && (
        <p className="text-gray-500">Aucun événement enregistré.</p>
      )}

      <div className="space-y-3">
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/staff/evenements/${e.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{e.title}</h3>
                <p className="font-mono text-xs text-gray-600">
                  {new Date(e.date).toLocaleDateString("fr-FR")} — {e.type}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
