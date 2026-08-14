import { useState } from "react";
import { motion } from "framer-motion";
import { validatePlayerName } from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";

interface RecruitSetupScreenProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function RecruitSetupScreen({ onComplete, onBack }: RecruitSetupScreenProps) {
  const { gns, registerPlayer } = useGNSRequired();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validatePlayerName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    await registerPlayer(name);
    onComplete();
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-panel-border bg-panel p-8"
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 text-[10px] text-metal transition-colors hover:text-foreground"
          >
            ← Retour au choix des dossiers
          </button>
        )}

        <p className="text-[10px] uppercase tracking-widest text-terminal">
          Identification personnel — Site-12
        </p>
        <h1 className="mt-2 text-lg text-foreground">Nouvelle recrue</h1>
        <p className="mt-2 text-xs text-metal">
          Ce nom sera associé à un nouveau dossier saga. Vos autres personnages restent
          enregistrés séparément.
        </p>

        <div className="mt-6 border border-panel-border bg-classified p-3 text-[11px]">
          <p className="text-metal">Grade attribué</p>
          <p className="mt-1 text-foreground">Recrue — Département Général</p>
          <p className="mt-2 text-metal">Clearance initiale</p>
          <p className="text-foreground">Niveau 1</p>
          <p className="mt-2 font-mono text-[9px] text-metal/70">
            Dossier {gns.saveId.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="recruit-name"
              className="block text-[10px] uppercase tracking-wider text-metal"
            >
              Nom d&apos;affichage
            </label>
            <input
              id="recruit-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Ex. Alex Martin"
              maxLength={32}
              autoFocus
              className="mt-2 w-full border border-panel-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-terminal/50"
            />
            {error && <p className="mt-2 text-[11px] text-redlake">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || name.trim().length < 2}
            className="w-full border border-redlake/50 bg-redlake/10 py-2.5 text-xs text-foreground transition-colors hover:bg-redlake/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Enregistrement..." : "Activer le terminal"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
