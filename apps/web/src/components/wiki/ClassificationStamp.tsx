import { SCPClass } from "@/data/scp";
import { cn } from "@/lib/utils";

const stampColor: Record<SCPClass, string> = {
  Safe: "border-green-400 text-green-400",
  Euclid: "border-yellow-400 text-yellow-400",
  Keter: "border-red-400 text-red-400",
  Thaumiel: "border-purple-400 text-purple-400",
  Apollyon: "border-orange-400 text-orange-400",
};

export function ClassificationStamp({
  scpClass,
  restricted,
}: {
  scpClass: SCPClass;
  restricted: boolean;
}) {
  return (
    <div
      className={cn(
        "glitch absolute right-4 top-4 rotate-[6deg] cursor-default select-none rounded border-[3px] px-3 py-1 text-center font-mono text-[10px] font-black uppercase tracking-widest opacity-80 sm:text-xs",
        stampColor[scpClass]
      )}
    >
      Niveau {scpClass}
      {restricted && (
        <span className="mt-0.5 block text-[8px] tracking-[0.2em] sm:text-[9px]">
          Accès restreint
        </span>
      )}
    </div>
  );
}
