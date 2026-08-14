import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import {
  getTransmissions,
  TRANSMISSION_TYPE_LABELS,
  foundationTimestamp,
} from "@/lib/transmissions";

/**
 * Aperçu du flux Discord → Site sur la page d'accueil.
 * Rendu uniquement s'il existe des transmissions accessibles (sinon invisible,
 * pour éviter toute section vide quand l'API n'est pas démarrée).
 */
export async function TransmissionsPreview() {
  const all = await getTransmissions(20);
  // On ne montre en aperçu public que les transmissions de faible habilitation.
  const items = all.filter((t) => t.clearance <= 2).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-redlake-glow">
              <Radio className="h-3 w-3" />
              RÉSEAU SITE-12
            </p>
            <h2 className="text-3xl font-bold text-white">
              Transmissions de la Fondation
            </h2>
          </div>
          <Link
            href="/transmissions"
            className="hidden items-center gap-1 font-mono text-sm text-gray-400 hover:text-redlake-glow sm:flex"
          >
            Voir le flux complet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <Link
              key={t.id}
              href="/transmissions"
              className="group hologram-border rounded-lg p-5 transition-all hover:border-redlake/40"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded border border-redlake/30 bg-redlake/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-redlake-glow">
                  {TRANSMISSION_TYPE_LABELS[t.type]}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                  {t.channelLabel}
                </span>
              </div>
              <h3 className="mb-1 font-bold text-white group-hover:text-redlake-glow">
                {t.title}
              </h3>
              <p className="line-clamp-2 text-sm text-gray-500">{t.body}</p>
              <p className="mt-3 font-mono text-[10px] text-gray-600">
                EXP. {t.codename} · {foundationTimestamp(t.occurredAt)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
