"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Fingerprint,
  MessageCircle,
  ServerOff,
  Lock,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { authErrorMessages } from "@/lib/auth-messages";
import { apiFetch, checkApiAvailable } from "@/lib/api";

export function RpLoginTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [apiOnline, setApiOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const [devOpen, setDevOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [devError, setDevError] = useState("");
  const [devLoading, setDevLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const online = await checkApiAvailable();
      setApiOnline(online);
      if (online) {
        try {
          const me = await apiFetch<{ authenticated: boolean }>("/auth/me");
          if (me.authenticated) {
            router.replace(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
            return;
          }
        } catch {
          /* ignore */
        }
      }
      setChecking(false);
    })();
  }, [router, redirectTo]);

  const devLogin = async () => {
    if (!username.trim()) {
      setDevError("Designation agent requise");
      return;
    }
    setDevLoading(true);
    setDevError("");
    try {
      await apiFetch("/auth/dev-login", {
        method: "POST",
        body: JSON.stringify({ username: username.trim() }),
      });
      router.push(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
    } catch {
      setDevError("Echec connexion technique");
    } finally {
      setDevLoading(false);
    }
  };

  const errorInfo = errorCode ? authErrorMessages[errorCode] : null;

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-gray-500">
        Initialisation du terminal d&apos;habilitation...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded border border-redlake/50 bg-redlake/10">
          <Shield className="h-8 w-8 text-redlake-glow" />
        </div>
        <p className="font-mono text-xs tracking-[0.3em] text-redlake-glow">
          SITE-12 // ACCES SECURISE
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Terminal d&apos;habilitation
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Authentifiez-vous pour acceder a votre dossier personnel de la Fondation.
        </p>
      </div>

        {!apiOnline && (
          <div className="mb-6 flex gap-3 rounded border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-400">
            <ServerOff className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold font-mono text-xs">API HORS LIGNE</p>
              <p className="mt-1 text-yellow-400/80">
                1. Ouvre <strong>Docker Desktop</strong> et attends qu&apos;il soit pret
                <br />
                2. <strong>Lancer-HUB.bat</strong> → option <strong>8</strong> (Postgres)
                puis <strong>2</strong> ou <strong>3</strong> (Site + API)
              </p>
              <p className="mt-2 font-mono text-[10px] text-yellow-500/70">
                Sans PostgreSQL (port 5432), l&apos;API ne demarre pas.
              </p>
            </div>
          </div>
        )}

      {errorInfo && (
        <div className="mb-6 rounded border border-redlake/40 bg-redlake/10 p-4">
          <p className="flex items-center gap-2 font-mono text-xs text-redlake-glow">
            <AlertTriangle className="h-4 w-4" />
            {errorInfo.title.toUpperCase()}
          </p>
          <p className="mt-2 text-sm text-gray-400">{errorInfo.body}</p>
          {errorCode === "discord_not_member" && (
            <div className="mt-4 space-y-2 font-mono text-xs text-gray-500">
              <a
                href={siteConfig.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[#aab1ff] hover:underline"
              >
                <MessageCircle className="h-3 w-3" />
                Rejoindre le Discord
              </a>
              <p>Revenez ensuite ici et reessayez la connexion.</p>
            </div>
          )}
          {errorCode === "discord_not_linked" && (
            <div className="mt-4 space-y-2 font-mono text-xs text-gray-500">
              <p>1. Rejoignez le serveur Discord REDLAKES</p>
              <p>2. Jouez sur Minecraft ou utilisez l&apos;acces technique ci-dessous</p>
              <p>3. Liez avec <span className="text-white">/link CODE</span> sur Discord</p>
              <p>4. Revenez ici et connectez-vous avec Discord</p>
              <a
                href={siteConfig.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[#aab1ff] hover:underline"
              >
                <MessageCircle className="h-3 w-3" />
                Rejoindre le Discord
              </a>
            </div>
          )}
        </div>
      )}

      <div className="hologram-border space-y-4 rounded-lg p-6">
        <p className="font-mono text-[10px] tracking-widest text-gray-600">
          METHODE PRIMAIRE — IDENTITE DISCORD
        </p>

        {apiOnline && siteConfig.discordOAuthEnabled ? (
          <a
            href="/api/auth/discord"
            className="flex w-full items-center justify-center gap-3 rounded border border-[#5865F2]/50 bg-[#5865F2]/15 py-4 font-mono text-sm uppercase tracking-wider text-white transition-colors hover:bg-[#5865F2]/25"
          >
            <MessageCircle className="h-5 w-5 text-[#aab1ff]" />
            Connexion avec Discord
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </a>
        ) : (
          <p className="text-center font-mono text-xs text-gray-600">
            Connexion Discord indisponible
          </p>
        )}

        <p className="text-center text-xs text-gray-600">
          Connexion directe via votre identite Discord du serveur REDLAKES.
        </p>

        {apiOnline && siteConfig.microsoftOAuthEnabled && (
          <>
            <div className="relative py-1 text-center">
              <span className="font-mono text-[10px] text-gray-700">OU</span>
            </div>
            <a
              href="/api/auth/minecraft"
              className="block w-full rounded border border-redlake/40 bg-redlake/10 py-3 text-center font-mono text-xs uppercase tracking-wider text-white hover:bg-redlake/20"
            >
              <Fingerprint className="mr-2 inline h-4 w-4" />
              Connexion Minecraft / Microsoft
            </a>
          </>
        )}
      </div>

      {siteConfig.devLoginEnabled && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setDevOpen(!devOpen)}
            className="flex w-full items-center justify-between rounded border border-metal/50 bg-black/40 px-4 py-3 font-mono text-xs text-gray-500 hover:text-gray-300"
          >
            <span className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              Acces technique (pre-ouverture / tests)
            </span>
            <ChevronRight
              className={`h-4 w-4 transition-transform ${devOpen ? "rotate-90" : ""}`}
            />
          </button>

          {devOpen && (
            <div className="mt-2 space-y-3 rounded border border-metal/30 bg-black/60 p-4">
              <p className="font-mono text-[10px] text-gray-600">
                DEV-LOGIN — Ne pas utiliser en production. Cree un profil local lie a un pseudo.
              </p>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && devLogin()}
                placeholder="Pseudo Minecraft"
                className="w-full rounded border border-metal bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-redlake"
              />
              {devError && (
                <p className="font-mono text-xs text-red-400">{devError}</p>
              )}
              <button
                type="button"
                onClick={devLogin}
                disabled={devLoading || !apiOnline}
                className="w-full rounded border border-metal py-2 font-mono text-xs uppercase text-gray-400 hover:border-redlake hover:text-white disabled:opacity-40"
              >
                {devLoading ? "Verification..." : "Ouvrir dossier test"}
              </button>
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-center">
        <Link
          href="/"
          className="font-mono text-xs text-gray-600 hover:text-redlake-glow"
        >
          Retour a l&apos;encyclopedie
        </Link>
      </p>
    </div>
  );
}
