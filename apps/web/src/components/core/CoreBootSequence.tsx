"use client";

import { useEffect, useState } from "react";
import type { CoreSession } from "@/hooks/useCoreSession";

interface CoreBootSequenceProps {
  session: CoreSession;
  onComplete: () => void;
}

const TOTAL_DURATION_MS = 2200;

export function CoreBootSequence({ session, onComplete }: CoreBootSequenceProps) {
  const [progress, setProgress] = useState(0);
  const Icon = session.theme.icon;

  const lines = [
    "Connexion sécurisée...",
    "",
    `IDENTITÉ : ${session.displayName ?? "—"}`,
    `RÉSEAU : ${session.vocab.network}`,
    `GRADE : ${session.character?.grade ?? "Civil"}`,
    "STATUT : ACTIF",
  ];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / TOTAL_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        onComplete();
      }
    }, 40);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`scanlines crt-noise fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black ${session.theme.fontVariable}`}
    >
      <button
        type="button"
        onClick={onComplete}
        className="absolute right-6 top-6 font-mono text-xs text-gray-600 hover:text-white"
      >
        Passer →
      </button>

      <div className="w-full max-w-md px-6">
        <div className="mb-6 flex flex-col items-center gap-3 core-boot-line">
          <Icon
            className="h-10 w-10"
            style={{ color: session.theme.colors.glow, filter: `drop-shadow(0 0 10px ${session.theme.colors.glow})` }}
          />
          <p
            className="text-xl font-bold tracking-[0.15em]"
            style={{ color: session.theme.colors.glow, fontFamily: session.theme.headingFont }}
          >
            REDLAKES CORE
          </p>
        </div>

        <div className="font-mono text-sm">
          {lines.map((line, i) => (
            <p
              key={i}
              className="mb-1 core-boot-line"
              style={{ color: "#9ca3af", animationDelay: `${300 + i * 180}ms` }}
            >
              {line || " "}
            </p>
          ))}
        </div>

        <div className="mt-4 h-1 w-full overflow-hidden rounded bg-white/10">
          <div
            className="h-full transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%`, background: session.theme.colors.glow }}
          />
        </div>
      </div>
    </div>
  );
}
