import type { SCPClass } from "@/data/scp";
import { classHex } from "@/data/scp";

/** Niveau de menace en 5 segments, à la couleur de la classe de l'objet. */
export function ThreatBars({ level, scpClass }: { level: number; scpClass: SCPClass }) {
  const filled = Math.max(0, Math.min(5, level));
  const color = classHex[scpClass] ?? "#e6eaf0";
  return (
    <span className="flex items-center gap-1" aria-label={`Niveau de menace ${filled} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="h-2 w-5" style={{ background: i < filled ? color : "rgba(230,234,240,0.1)" }} />
      ))}
    </span>
  );
}
