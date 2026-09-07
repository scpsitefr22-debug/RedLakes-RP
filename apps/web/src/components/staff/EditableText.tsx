"use client";

import { useEffect, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useEditMode } from "./EditModeProvider";
import { DiscordMarkdown } from "@/components/ui/DiscordMarkdown";

interface EditableTextProps {
  /** Valeur actuelle — null/undefined/"" affiche un placeholder cliquable en mode édition. */
  value: string | null | undefined;
  /** Route API à PATCH, ex. `/factions/${faction.id}`. */
  endpoint: string;
  /** Nom du champ envoyé dans le corps du PATCH, ex. "title". */
  field: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  /** Rendu Markdown (DiscordMarkdown) au lieu du texte brut en lecture. */
  markdown?: boolean;
  /** Découpe la valeur en paragraphes ("\n\n") rendus en Markdown chacun — pour les longs corps de texte (lore, documents). `className` s'applique à chaque paragraphe, `wrapperClassName` au conteneur. */
  paragraphs?: boolean;
  wrapperClassName?: string;
  /** Liens SCP internes du Markdown (page Wiki uniquement) — voir DiscordMarkdown. */
  scpRefsSlug?: string;
}

/**
 * Édition en place réservée au STAFF/ADMIN via le bouton "Mode édition"
 * (EditModeToggle) — hors de ce mode, rend exactement comme le texte brut
 * d'origine (aucune différence visuelle pour un visiteur normal). PATCH
 * direct sur l'endpoint existant du type de contenu (aucune nouvelle route
 * API).
 *
 * Le rendu Markdown/paragraphes est géré ICI via des props booléennes
 * (`markdown`, `paragraphs`) plutôt qu'une fonction `render` passée par
 * l'appelant : plusieurs pages consommant ce composant sont des Server
 * Components (Factions, Grades, Wiki, Événements, Actualités...), et une
 * fonction ne peut pas traverser la frontière Server → Client Component en
 * tant que prop (erreur RSC "Functions cannot be passed directly to Client
 * Components") — seules des valeurs sérialisables passent.
 *
 * L'affichage après sauvegarde repose sur un état local (`savedValue`), pas
 * uniquement sur `router.refresh()` : les pages Server Component profitent
 * du refresh (re-fetch + nouvelles props), mais plusieurs pages consommant
 * ce composant chargent leurs données côté client via useEffect (carte,
 * personnages, lore, documents) — `router.refresh()` ne relance pas ce
 * fetch-là. Sans état local, l'édition semblerait "ne pas se voir" tant que
 * la page n'est pas rechargée manuellement sur ces pages-là.
 */
export function EditableText({
  value,
  endpoint,
  field,
  as = "span",
  multiline = false,
  className = "",
  placeholder = "Cliquer pour ajouter…",
  markdown = false,
  paragraphs = false,
  wrapperClassName = "",
  scpRefsSlug,
}: EditableTextProps) {
  const { editMode } = useEditMode();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [savedValue, setSavedValue] = useState(value ?? "");
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Si le parent refetch et fournit une nouvelle prop (Server Component
  // rafraîchi par router.refresh(), ou navigation vers une autre fiche),
  // on suit — sans ça une navigation client-side entre deux fiches du même
  // type garderait la valeur de la fiche precedente.
  useEffect(() => {
    setSavedValue(value ?? "");
  }, [value]);

  const Tag = as as ElementType;
  const displayValue = savedValue;

  const display = (v: string) => {
    if (paragraphs) {
      return (
        <div className={wrapperClassName}>
          {v.split("\n\n").filter(Boolean).map((p, i) => (
            <DiscordMarkdown key={i} text={p} className={className} scpRefsSlug={scpRefsSlug} />
          ))}
        </div>
      );
    }
    if (markdown) {
      return <DiscordMarkdown text={v} className={className} scpRefsSlug={scpRefsSlug} />;
    }
    return <Tag className={className}>{v}</Tag>;
  };

  if (!editMode) {
    if (!displayValue) return null;
    return display(displayValue);
  }

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ [field]: draft }),
      });
      setSavedValue(draft);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="my-2 space-y-2 rounded border border-redlake/40 bg-black/60 p-3">
        {multiline ? (
          <textarea
            autoFocus
            rows={8}
            className="w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <input
            autoFocus
            className="w-full rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1 rounded border border-green-400/40 bg-green-400/10 px-3 py-1.5 font-mono text-xs text-green-400 hover:bg-green-400/20 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="flex items-center gap-1 rounded border border-metal px-3 py-1.5 font-mono text-xs text-gray-400 hover:text-white disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        setDraft(displayValue);
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setDraft(displayValue);
          setEditing(true);
        }
      }}
      className="group/edit relative inline-block w-full cursor-pointer rounded outline-dashed outline-1 outline-offset-4 outline-redlake/30 transition-colors hover:bg-redlake/5"
    >
      {displayValue ? (
        display(displayValue)
      ) : (
        <Tag className={`${className} italic text-gray-600`}>{placeholder}</Tag>
      )}
      <Pencil className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-black text-redlake-glow opacity-0 transition-opacity group-hover/edit:opacity-100" />
    </div>
  );
}
