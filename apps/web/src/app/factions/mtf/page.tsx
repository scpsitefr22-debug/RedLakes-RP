import Link from "next/link";
import { mtfUnits } from "@/data/factions";
import { Shield } from "lucide-react";

export const metadata = { title: "MTF — Mobile Task Forces" };

export default function MTFPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          FORCES D&apos;INTERVENTION MOBILES
        </p>
        <h1 className="text-4xl font-bold text-white">Mobile Task Forces</h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          Unités d&apos;élite de la Fondation déployées en cas de brèche,
          confinement ou menace active.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mtfUnits.map((mtf) => (
          <Link
            key={mtf.id}
            href={`/factions/mtf/${mtf.id}`}
            className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
          >
            <div className="mb-3 flex items-center gap-3">
              <Shield className="h-6 w-6 text-redlake-glow" />
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-redlake-glow">
                  {mtf.name}
                </h2>
                <p className="font-mono text-sm text-gray-500">
                  &quot;{mtf.codename}&quot;
                </p>
              </div>
            </div>
            <p className="mb-4 italic text-gray-500">{mtf.motto}</p>
            <p className="line-clamp-2 text-sm text-gray-600">{mtf.history}</p>
            <p className="mt-3 font-mono text-xs text-gray-600">
              Effectif : {mtf.personnel} agents
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
