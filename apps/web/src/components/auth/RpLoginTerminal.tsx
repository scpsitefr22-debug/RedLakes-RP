"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  MessageCircle,
  ServerOff,
  Lock,
  ChevronRight,
  AlertTriangle,
  UserPlus,
  LogIn,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { authErrorMessages } from "@/lib/auth-messages";
import { apiFetch, checkApiAvailable } from "@/lib/api";

export function RpLoginTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const redirectTo = searchParams.get("redirect") ?? "/bienvenue";

  const [apiOnline, setApiOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const [devOpen, setDevOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [devError, setDevError] = useState("");
  const [devLoading, setDevLoading] = useState(false);

  // Compte REDLAKES par pseudo + mot de passe — moteur de connexion
  // principal. Discord (plus bas) ne sert plus qu'à la liaison bot.
  const [mode, setMode] = useState<"login" | "register">("login");
  const [rlUsername, setRlUsername] = useState("");
  const [rlPassword, setRlPassword] = useState("");
  const [rlError, setRlError] = useState("");
  const [rlLoading, setRlLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const online = await checkApiAvailable();
      setApiOnline(online);
      // Si une erreur accompagne l'arrivee (ex. liaison Discord echouee pour
      // un compte deja connecte), on reste sur la page pour l'afficher —
      // sinon la redirection automatique ci-dessous l'escamote aussitot.
      if (online && !errorCode) {
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
  }, [router, redirectTo, errorCode]);

  const submitAccount = async () => {
    if (!rlUsername.trim() || !rlPassword) {
      setRlError("Pseudo et mot de passe requis");
      return;
    }
    setRlLoading(true);
    setRlError("");
    try {
      await apiFetch(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({
          username: rlUsername.trim(),
          password: rlPassword,
        }),
      });
      router.push(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
    } catch (err) {
      setRlError(
        err instanceof Error ? err.message : "Une erreur est survenue",
      );
    } finally {
      setRlLoading(false);
    }
  };

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
          Créez votre compte REDLAKES ou connectez-vous pour accéder à votre
          dossier personnel.
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
        <div className="flex rounded border border-metal/50 p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setRlError("");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded py-2 uppercase tracking-wider transition-colors ${
              mode === "login"
                ? "bg-redlake/20 text-redlake-glow"
                : "text-gray-500 hover:text-white"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setRlError("");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded py-2 uppercase tracking-wider transition-colors ${
              mode === "register"
                ? "bg-redlake/20 text-redlake-glow"
                : "text-gray-500 hover:text-white"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Créer un compte
          </button>
        </div>

        <input
          value={rlUsername}
          onChange={(e) => setRlUsername(e.target.value)}
          placeholder="Pseudo"
          autoComplete="username"
          className="w-full rounded border border-metal bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-redlake"
        />
        <input
          type="password"
          value={rlPassword}
          onChange={(e) => setRlPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitAccount()}
          placeholder="Mot de passe"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="w-full rounded border border-metal bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-redlake"
        />
        {rlError && (
          <p className="font-mono text-xs text-redlake-glow">{rlError}</p>
        )}
        <button
          type="button"
          onClick={submitAccount}
          disabled={rlLoading || !apiOnline}
          className="w-full rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white transition-colors hover:bg-redlake/30 disabled:opacity-50"
        >
          {rlLoading
            ? "Vérification..."
            : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-gray-600">
        La liaison Discord (obligatoire) se fait juste après la création de
        votre compte — synchronisation avec le bot (grades, notifications) et
        confirmation de votre appartenance à la communauté REDLAKES.
      </p>

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
