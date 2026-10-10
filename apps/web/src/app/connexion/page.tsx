import { Suspense } from "react";
import { RpLoginTerminal } from "@/components/auth/RpLoginTerminal";

export const metadata = {
  title: "Connexion — Site-12",
  description: "Terminal d'habilitation REDLAKES RP",
};

const PROMISES = [
  "Un poste au Site-12 et une hiérarchie à gravir.",
  "Un dossier personnel qui suit ton personnage sur le site, Discord et Minecraft.",
  "L'encyclopédie, les rapports et l'intranet de ta faction.",
];

export default function ConnexionPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1440px] lg:grid-cols-[1.1fr_1fr]">
      {/* Panneau d'ambiance — sans la carte du serveur, outil HRP réservé au staff. */}
      <aside className="relative hidden overflow-hidden border-r border-line lg:block">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgba(230,234,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(230,234,240,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(7,9,12,0.92) 0%, rgba(7,9,12,0.55) 60%, rgba(7,9,12,0.85) 100%), radial-gradient(ellipse at 30% 40%, rgba(229,57,47,0.14), transparent 60%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0 1px, transparent 1px 3px)" }}
          aria-hidden
        />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-redlake-glow/60 shadow-[0_0_12px_2px_rgba(229,57,47,0.45)] motion-safe:animate-[hero-scan_7s_linear_infinite]" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <p className="label-mono flex items-center gap-3 text-redlake-glow">
            <span className="h-px w-10 bg-redlake-glow" aria-hidden />
            Fondation SCP — Terminal d&apos;habilitation
          </p>

          <div>
            <p className="font-display font-extrabold uppercase leading-[0.82] text-white">
              <span className="block text-[clamp(4rem,7.5vw,7.5rem)]">Redlakes</span>
              <span className="block text-[clamp(2.75rem,5vw,5rem)] text-transparent" style={{ WebkitTextStroke: "2px #e5392f" }}>
                Site-12
              </span>
            </p>
            <p className="font-display mt-6 text-xl font-semibold uppercase tracking-[0.18em] text-gray-300">
              Sécuriser · Contenir · Protéger
            </p>
            <ul className="mt-8 max-w-md space-y-3">
              {PROMISES.map((line) => (
                <li key={line} className="flex gap-3 text-gray-300">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-redlake-glow" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <p className="label-mono text-[10px] text-gray-500">Liaison chiffrée — chaque accès est journalisé</p>
        </div>
      </aside>

      <div className="flex items-center justify-center">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center font-mono text-gray-500">
              Chargement du terminal...
            </div>
          }
        >
          <RpLoginTerminal />
        </Suspense>
      </div>
    </div>
  );
}
