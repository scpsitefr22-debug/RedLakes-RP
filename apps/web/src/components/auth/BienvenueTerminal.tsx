"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface MeResponse {
  authenticated: boolean;
  user?: { onboarded: boolean };
}

export function BienvenueTerminal() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<MeResponse>("/auth/me");
        if (!me.authenticated) {
          router.replace("/connexion");
          return;
        }
        if (me.user?.onboarded) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        router.replace("/connexion");
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await apiFetch("/players/me", {
        method: "PATCH",
        body: JSON.stringify({
          rpFirstName: firstName.trim() || undefined,
          rpLastName: lastName.trim() || undefined,
        }),
      });
      await apiFetch("/auth/onboarding/complete", { method: "POST" });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-gray-500">
        Initialisation du dossier personnel...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded border border-redlake/50 bg-redlake/10">
          <UserPlus className="h-8 w-8 text-redlake-glow" />
        </div>
        <p className="font-mono text-xs tracking-[0.3em] text-redlake-glow">
          COMPTE REDLAKES // ÉTAPE FINALE
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Bienvenue sur REDLAKES
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Votre Discord est lié. Il ne reste plus qu&apos;à créer votre personnage
          pour accéder à votre dossier.
        </p>
      </div>

      <div className="hologram-border space-y-4 rounded-lg p-6">
        <p className="font-mono text-[10px] tracking-widest text-gray-600">
          IDENTITÉ RP
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-mono text-xs text-gray-500">Prénom RP</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={32}
              placeholder="Jean"
              className="w-full rounded border border-metal bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-redlake/50"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-xs text-gray-500">Nom RP</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={32}
              placeholder="Dupont"
              className="w-full rounded border border-metal bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-redlake/50"
            />
          </label>
        </div>
        {error && <p className="font-mono text-xs text-redlake-glow">{error}</p>}
        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className="w-full rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white transition-colors hover:bg-redlake/30 disabled:opacity-50"
        >
          {busy ? "Création..." : "Créer mon personnage"}
        </button>
        <p className="text-center font-mono text-[10px] text-gray-600">
          Optionnel — vous pouvez laisser vide et renseigner l&apos;identité plus
          tard depuis votre dossier.
        </p>
      </div>
    </div>
  );
}
