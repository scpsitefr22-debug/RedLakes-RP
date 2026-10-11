"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** Accès direct à un dossier : « ACCÉDER SCP-682 » ouvre la fiche. */
export function TerminalSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const match = /(\d{2,4})/.exec(value);
    if (!match) {
      setError("Format : ACCÉDER SCP-682");
      return;
    }
    setError(null);
    router.push(`/wiki/scp-${match[1].padStart(3, "0")}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <label className="flex items-center gap-2 border border-terminal/30 bg-black/60 px-3 py-2.5 font-mono text-sm text-terminal focus-within:border-terminal/70">
        <span aria-hidden>&gt;_</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ACCÉDER SCP-682"
          aria-label="Ouvrir un dossier par son numéro"
          className="flex-1 bg-transparent text-terminal outline-none placeholder:text-terminal/40"
        />
        <span className="label-mono hidden text-[9px] text-terminal/50 sm:inline">Entrée</span>
      </label>
      {error && <p className="mt-1.5 text-xs text-redlake-glow">{error}</p>}
    </form>
  );
}
