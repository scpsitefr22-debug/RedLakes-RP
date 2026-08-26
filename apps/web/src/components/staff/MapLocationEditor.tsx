"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Save, ArrowLeft, Trash2, MapPin } from "lucide-react";

const LOCATION_TYPES = ["site", "surface", "ville", "egouts", "criminel", "labo", "scp", "portail", "ennemi", "village", "nature", "incident", "ferme"];

export interface MapLocationFormData {
  slug: string;
  name: string;
  type: string;
  x: string;
  y: string;
  description: string;
  history: string;
  danger: string;
  faction: string;
}

interface MapLocationEditorProps {
  initial?: Partial<MapLocationFormData>;
  locationId?: string;
  mode: "create" | "edit";
}

export function MapLocationEditor({ initial, locationId, mode }: MapLocationEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<MapLocationFormData>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    type: initial?.type ?? "site",
    x: initial?.x ?? "50",
    y: initial?.y ?? "50",
    description: initial?.description ?? "",
    history: initial?.history ?? "",
    danger: initial?.danger ?? "1",
    faction: initial?.faction ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const placeOnMap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    update("x", x.toFixed(1));
    update("y", y.toFixed(1));
  };

  const update = (key: keyof MapLocationFormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name" && mode === "create") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((f) => ({ ...f, slug }));
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        name: form.name,
        type: form.type,
        x: Number(form.x) || 0,
        y: Number(form.y) || 0,
        description: form.description,
        history: form.history,
        danger: Number(form.danger) || 1,
        faction: form.faction || undefined,
      };

      if (mode === "create") {
        await apiFetch("/map", { method: "POST", body: JSON.stringify(payload) });
        router.push("/staff/carte");
      } else if (locationId) {
        const { slug: _slug, ...updatePayload } = payload;
        await apiFetch(`/map/${locationId}`, { method: "PATCH", body: JSON.stringify(updatePayload) });
        router.push("/staff/carte");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — connectez-vous en staff pour éditer.`
          : "Erreur de sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!locationId || !confirm(`Supprimer définitivement "${form.name}" ?`)) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/map/${locationId}`, { method: "DELETE" });
      router.push("/staff/carte");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded border border-metal bg-black px-4 py-2 text-white outline-none focus:border-redlake";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/staff/carte"
        className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la carte
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">
        {mode === "create" ? "Nouvel emplacement" : `Modifier — ${form.name}`}
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Nom</label>
          <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Site-12 — Complexe Principal" />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            Slug (URL — {mode === "edit" ? "non modifiable" : "généré depuis le nom"})
          </label>
          <input className={inputClass} value={form.slug} onChange={(e) => update("slug", e.target.value)} disabled={mode === "edit"} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Type</label>
            <select className={inputClass} value={form.type} onChange={(e) => update("type", e.target.value)}>
              {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Danger (1-5)</label>
            <input type="number" min={1} max={5} className={inputClass} value={form.danger} onChange={(e) => update("danger", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">
            Position — cliquez sur la carte pour placer le point
          </label>
          <div
            ref={mapRef}
            onClick={placeOnMap}
            className="relative aspect-[1126/923] w-full cursor-crosshair overflow-hidden rounded border border-metal bg-black bg-cover bg-center"
            style={{ backgroundImage: "url(/carte/redlakes-map.png)" }}
          >
            <div
              className="pointer-events-none absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-redlake-glow bg-redlake/30"
              style={{ left: `${Number(form.x) || 0}%`, top: `${Number(form.y) || 0}%` }}
            >
              <MapPin className="h-4 w-4 text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Position X (0-100%)</label>
            <input type="number" min={0} max={100} step={0.1} className={inputClass} value={form.x} onChange={(e) => update("x", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-gray-500">Position Y (0-100%)</label>
            <input type="number" min={0} max={100} step={0.1} className={inputClass} value={form.y} onChange={(e) => update("y", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Description</label>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Historique</label>
          <textarea rows={3} className={inputClass} value={form.history} onChange={(e) => update("history", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs text-gray-500">Faction (optionnel)</label>
          <input className={inputClass} value={form.faction} onChange={(e) => update("faction", e.target.value)} />
        </div>

        <button
          onClick={save}
          disabled={saving || !form.name || !form.type}
          className="flex w-full items-center justify-center gap-2 rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        {mode === "edit" && locationId && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-400/40 py-3 font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer l&apos;emplacement
          </button>
        )}
      </div>
    </div>
  );
}
