export function DangerComparison({ percentile, level }: { percentile: number; level: number }) {
  return (
    <p className="mt-3 font-mono text-[11px] text-gray-500">
      Niveau de menace {level}/5 — plus dangereux que{" "}
      <span className="text-redlake-glow">{percentile}%</span> des objets confinés répertoriés.
    </p>
  );
}
