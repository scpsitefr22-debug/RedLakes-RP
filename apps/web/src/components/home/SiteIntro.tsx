"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, LogIn, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface MeResponse {
  authenticated: boolean;
  user?: {
    redlakesUsername?: string | null;
    activeCharacter?: { rpFirstName?: string | null } | null;
  };
}

const BOOT_LINES = [
  "> Établissement de la liaison sécurisée...",
  "> Réseau RÉSEAU INDÉPENDANT — Site-12 détecté",
  "> Vérification de l'habilitation...",
];

/**
 * Porte d'entree du site — seule / est publique (voir middleware.ts),
 * donc c'est ici que se joue la petite sequence "boot terminal" avant de
 * reveler le contenu (connecte) ou de pousser vers /connexion (visiteur).
 * Les enfants (le reste de la page d'accueil marketing) ne s'affichent
 * qu'une fois un compte confirme — jamais pour un visiteur anonyme.
 */
export function SiteIntro({ children }: { children: React.ReactNode }) {
  const [lineCount, setLineCount] = useState(0);
  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState<MeResponse>({ authenticated: false });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<MeResponse>("/auth/me")
      .then((res) => {
        if (!cancelled) setMe(res);
      })
      .catch(() => {
        if (!cancelled) setMe({ authenticated: false });
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (lineCount >= BOOT_LINES.length) return;
    const t = setTimeout(() => setLineCount((n) => n + 1), 550);
    return () => clearTimeout(t);
  }, [lineCount]);

  const bootDone = lineCount >= BOOT_LINES.length;
  const done = bootDone && !checking;

  if (done && me.authenticated && revealed) {
    return <>{children}</>;
  }

  const name = me.user?.activeCharacter?.rpFirstName || me.user?.redlakesUsername;

  return (
    <div className="scanlines crt-noise flex min-h-[85vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 font-mono text-sm text-emerald-400/90">
          {BOOT_LINES.slice(0, lineCount).map((line, i) => (
            <p key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
              {line}
            </p>
          ))}
          {!bootDone && <span className="animate-pulse">▌</span>}
        </div>

        {done && (
          <div className="hologram-border animate-in fade-in duration-500 space-y-6 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-redlake/60 bg-redlake/10">
              <ShieldAlert className="h-7 w-7 text-redlake-glow" />
            </div>

            {me.authenticated ? (
              <>
                <p className="label-mono text-redlake-glow">
                  ACCÈS AUTORISÉ
                </p>
                <h1 className="font-display text-5xl font-extrabold text-white">
                  Bonjour, {name ?? "agent"}.
                </h1>
                <p className="text-sm leading-relaxed text-gray-400">
                  Votre habilitation est confirmée. Le réseau REDLAKES vous
                  attend.
                </p>
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="font-display w-full bg-redlake-glow py-4 text-lg font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ff4a3f]"
                >
                  Entrer sur le réseau
                </button>
              </>
            ) : (
              <>
                <p className="label-mono text-redlake-glow">
                  SITE-12 // ACCÈS RESTREINT
                </p>
                <h1 className="font-display text-5xl font-extrabold text-white">
                  Bonjour, visiteur.
                </h1>
                <p className="text-sm leading-relaxed text-gray-400">
                  Le contenu du réseau REDLAKES est réservé aux agents
                  habilités. Identifiez-vous ou demandez une habilitation
                  pour continuer.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/connexion"
                    className="font-display flex items-center justify-center gap-2 bg-redlake-glow py-3.5 text-base font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff4a3f]"
                  >
                    <LogIn className="h-4 w-4" />
                    Se connecter
                  </Link>
                  <Link
                    href="/connexion"
                    className="font-display flex items-center justify-center gap-2 border border-line-strong py-3.5 text-base font-bold uppercase tracking-[0.12em] text-gray-200 transition-colors hover:border-white hover:text-white"
                  >
                    <UserPlus className="h-4 w-4" />
                    Créer un compte
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
