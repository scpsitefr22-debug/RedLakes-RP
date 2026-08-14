import Link from "next/link";
import { factions } from "@/data/factions";
import { Shield } from "lucide-react";

export const metadata = { title: "Factions" };

export default function FactionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ORGANISATIONS RECENSÉES
        </p>
        <h1 className="text-4xl font-bold text-white">Factions</h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          Toutes les organisations actives sur REDLAKES : gouvernementales,
          anomales, criminelles et occultes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {factions.map((f) => (
          <Link
            key={f.id}
            href={`/factions/${f.id}`}
            className="group hologram-border rounded-lg p-6 transition-all hover:border-redlake/40"
            style={{ borderLeftColor: f.color, borderLeftWidth: 4 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <Shield className="h-6 w-6" style={{ color: f.color }} />
              <h2 className="text-2xl font-bold text-white group-hover:text-redlake-glow">
                {f.name}
              </h2>
            </div>
            <p className="mb-3 italic text-gray-500">{f.tagline}</p>
            <p className="line-clamp-3 text-sm text-gray-600">{f.description}</p>
            <div className="mt-4 flex gap-3 font-mono text-xs">
              {f.playable && <span className="text-green-400">JOUABLE</span>}
              <span className="text-gray-600">Niv. {f.clearance}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
