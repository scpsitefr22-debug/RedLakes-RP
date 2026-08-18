"use client";

import { useEffect, useState } from "react";

function buildLines(number: string) {
  return [
    "CONNEXION AU TERMINAL SITE-12...",
    "VÉRIFICATION D'HABILITATION...",
    `DÉCHIFFREMENT DU DOSSIER ${number}...`,
    "ACCÈS AUTORISÉ.",
  ];
}

const STEP_MS = 260;

export function DeclassificationOverlay({ number }: { number: string }) {
  const [visible, setVisible] = useState(true);
  const [lineCount, setLineCount] = useState(0);
  const [fading, setFading] = useState(false);
  const lines = buildLines(number);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    const skip = () => setVisible(false);
    window.addEventListener("keydown", skip, { once: true });

    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, i) => {
      timers.push(setTimeout(() => setLineCount(i + 1), STEP_MS * (i + 1)));
    });
    timers.push(setTimeout(() => setFading(true), STEP_MS * (lines.length + 1)));
    timers.push(setTimeout(skip, STEP_MS * (lines.length + 1) + 350));

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={() => setVisible(false)}
      className={`scanlines crt-noise fixed inset-0 z-[999] flex cursor-pointer items-center justify-center bg-black transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-md px-6 font-mono text-xs text-terminal">
        {lines.slice(0, lineCount).map((line, i) => (
          <p key={i} className={i === lineCount - 1 ? "glitch" : ""}>
            &gt; {line}
          </p>
        ))}
        {lineCount < lines.length && (
          <span className="mt-1 inline-block h-3 w-1.5 animate-pulse bg-terminal align-middle" />
        )}
        <p className="mt-6 text-[10px] text-terminal/40">
          (cliquer ou appuyer sur une touche pour passer)
        </p>
      </div>
    </div>
  );
}
