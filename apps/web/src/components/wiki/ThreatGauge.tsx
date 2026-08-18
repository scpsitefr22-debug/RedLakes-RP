import { SCPClass } from "@/data/scp";
import { cn } from "@/lib/utils";

const fillColor: Record<SCPClass, string> = {
  Safe: "bg-green-400",
  Euclid: "bg-yellow-400",
  Keter: "bg-red-400",
  Thaumiel: "bg-purple-400",
  Apollyon: "bg-orange-400",
};

export function ThreatGauge({ level, scpClass }: { level: number; scpClass: SCPClass }) {
  const filled = Math.max(0, Math.min(5, level));
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
        Niveau de menace
      </span>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-3 rounded-sm border border-metal",
              i < filled ? fillColor[scpClass] : "bg-transparent"
            )}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-gray-500">{filled}/5</span>
    </div>
  );
}
