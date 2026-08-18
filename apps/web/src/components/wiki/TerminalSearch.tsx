"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function TerminalSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const match = /(\d{2,4})/.exec(value);
    if (!match) {
      setError("FORMAT INVALIDE — exemple : ACCÉDER SCP-682");
      return;
    }
    setError(null);
    router.push(`/wiki/scp-${match[1].padStart(3, "0")}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-terminal/30 bg-black/60 p-3 font-mono text-sm"
    >
      <div className="flex items-center gap-2 text-terminal">
        <span>&gt;_</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ACCÉDER SCP-682"
          className="flex-1 bg-transparent text-terminal outline-none placeholder:text-terminal/40"
        />
      </div>
      {error && <p className="mt-2 text-xs text-redlake-glow">{error}</p>}
    </form>
  );
}
