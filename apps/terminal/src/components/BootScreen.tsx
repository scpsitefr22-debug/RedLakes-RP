import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BOOT_LINES = [
  "REDLAKES SECURE TERMINAL v2.4.1",
  "Site-12 — REDLAKES BRANCH",
  "Connexion chiffrée... OK",
  "Vérification accréditation... EN ATTENTE",
  "Chargement Global Narrative Save... ",
  "Systèmes opérationnels.",
];

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayed, setDisplayed] = useState<string[]>([]);

  useEffect(() => {
    if (lineIndex >= BOOT_LINES.length) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
    const line = BOOT_LINES[lineIndex];
    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      setDisplayed((prev) => {
        const next = [...prev];
        next[lineIndex] = line.slice(0, charIndex);
        return next;
      });
      if (charIndex >= line.length) {
        clearInterval(interval);
        setTimeout(() => setLineIndex((i) => i + 1), 200);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [lineIndex, onComplete]);

  return (
    <div className="flex h-screen flex-col justify-end bg-background p-8 font-mono text-sm text-terminal">
      <div className="mb-8 space-y-1">
        {displayed.map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}>
            {line}
            {i === displayed.length - 1 && lineIndex < BOOT_LINES.length && (
              <span className="cursor-blink ml-0.5 inline-block h-3 w-2 bg-terminal" />
            )}
          </motion.div>
        ))}
      </div>
      <div className="text-xs text-metal">© FONDATION SCP — USAGE AUTORISÉ UNIQUEMENT</div>
    </div>
  );
}
