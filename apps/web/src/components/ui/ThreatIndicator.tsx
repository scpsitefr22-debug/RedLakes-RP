import { cn } from "@/lib/utils";
import type { SCPClass } from "@/data/scp";

interface ThreatIndicatorProps {
  scpClass: SCPClass;
  className?: string;
}

const CLASS_STYLES: Record<SCPClass, string> = {
  Safe: "border-green-400/30 bg-green-400/10 text-green-400",
  Euclid: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  Keter: "border-red-400/30 bg-red-400/10 text-red-400",
  Thaumiel: "border-purple-400/30 bg-purple-400/10 text-purple-400",
  Apollyon: "border-orange-400/30 bg-orange-400/10 text-orange-400",
};

export function ThreatIndicator({ scpClass, className }: ThreatIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest",
        CLASS_STYLES[scpClass],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {scpClass}
    </span>
  );
}
