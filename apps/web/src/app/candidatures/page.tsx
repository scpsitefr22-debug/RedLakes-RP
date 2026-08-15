"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { type PaginatedResult, buildQueryString } from "@/lib/platform-types";
import { siteConfig } from "@/config/site";

const applicationTypes = [
  { id: "STAFF", name: "Staff", description: "Modération, administration, support joueurs." },
  { id: "LORE", name: "Rédacteur Lore", description: "SCP, factions, personnages, chronologie." },
  { id: "BUILD", name: "Builder / Map", description: "Site-12, ville, zones RP, égouts." },
  { id: "RECHERCHE", name: "Recherche", description: "Chercheurs, scientifiques, archivistes." },
  { id: "ADMINISTRATION", name: "Community / Admin", description: "Discord, communication, logistique." },
];

const apiTypeMap: Record<string, string> = {
  LORE: "RECHERCHE",
  BUILD: "ADMINISTRATION",
};

interface MyApplication {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "text-yellow-400" },
  APPROVED: { label: "Validée", color: "text-green-400" },
  REJECTED: { label: "Refusée", color: "text-red-400" },
};

function CandidaturesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type");
  const initialType =
    typeFromUrl && applicationTypes.some((t) => t.id === typeFromUrl)
      ? typeFromUrl
      : null;
  const [selected, setSelected] = useState<string | null>(initialType);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [discord, setDiscord] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const auth = await apiFetch<{
          authenticated: boolean;
          user?: { username: string };
        }>("/auth/me");
        if (auth.authenticated && auth.user) {
          setAuthenticated(true);
          setUsername(auth.user.username);
          const apps = await apiFetch<PaginatedResult<MyApplication>>(
            `/applications/me${buildQueryString({ limit: 20 })}`,
          );
          setMyApplications(apps.items);
        }
      } catch {
        /* offline */
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!authenticated) {
      router.push(`/connexion?redirect=${encodeURIComponent("/candidatures")}`);
      return;
    }

    const apiType = apiTypeMap[selected!] ?? selected;
    const roleLabel = applicationTypes.find((t) => t.id === selected)?.name ?? selected;

    const experiencePayload = `[Poste visé : ${roleLabel} (${selected})]\n${experience}`;
    const motivationPayload = discord.trim()
      ? `[Discord : ${discord.trim()}]\n\n${motivation}`
      : motivation;

    try {
      await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify({
          type: apiType,
          experience: experiencePayload,
          motivation: motivationPayload,
        }),
      });
      setSubmitted(true);
      const apps = await apiFetch<PaginatedResult<MyApplication>>(
        `/applications/me${buildQueryString({ limit: 20 })}`,
      );
      setMyApplications(apps.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer la candidature — connectez-vous d'abord.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          RECRUTEMENT PRÉ-OUVERTURE
        </p>
        <h1 className="text-4xl font-bold text-white">Candidatures</h1>
        <p className="mt-4 text-gray-500">
          Le serveur n&apos;est pas encore ouvert — nous recrutons dès maintenant pour
          construire REDLAKES. Connectez-vous avant de soumettre un dossier.
        </p>
        {!siteConfig.serverOpen && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 font-mono text-xs text-yellow-400">
              <Clock className="h-3 w-3" />
              Serveur en préparation — candidatures ouvertes
            </div>
          </div>
        )}
      </div>

      {!checkingAuth && myApplications.length > 0 && (
        <section className="mb-8 hologram-border rounded-lg p-6">
          <h2 className="mb-4 font-bold text-white">Mes candidatures</h2>
          <ul className="space-y-2">
            {myApplications.map((app) => {
              const st = statusLabels[app.status] ?? {
                label: app.status,
                color: "text-gray-400",
              };
              return (
                <li
                  key={app.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-metal/40 px-4 py-2 font-mono text-sm"
                >
                  <span className="text-white">{app.type}</span>
                  <span className={st.color}>{st.label}</span>
                  <span className="text-xs text-gray-600">
                    {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {submitted ? (
        <div className="hologram-border rounded-lg p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
          <h2 className="mb-2 text-xl font-bold text-white">Candidature transmise</h2>
          <p className="text-gray-500">
            Votre dossier a été enregistré. Le staff vous contactera sur{" "}
            <a
              href={siteConfig.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#aab1ff] hover:underline"
            >
              Discord
            </a>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applicationTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelected(type.id)}
                className={`rounded-lg border p-5 text-left transition-all ${
                  selected === type.id
                    ? "border-redlake bg-redlake/10"
                    : "border-metal hover:border-redlake/30"
                }`}
              >
                <ClipboardList className="mb-2 h-5 w-5 text-redlake-glow" />
                <h3 className="font-bold text-white">{type.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{type.description}</p>
              </button>
            ))}
          </div>

          {selected && (
            <form onSubmit={submit} className="hologram-border space-y-4 rounded-lg p-6">
              {!authenticated && !checkingAuth && (
                <div className="flex items-start gap-2 rounded border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    <Link href="/connexion?redirect=/candidatures" className="underline">
                      Connectez-vous
                    </Link>{" "}
                    pour soumettre une candidature liée à votre dossier agent.
                  </p>
                </div>
              )}
              {error && <p className="text-sm text-red-400">{error}</p>}
              {authenticated && (
                <p className="font-mono text-xs text-gray-500">
                  Dossier : <span className="text-gray-300">{username}</span>
                </p>
              )}
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">
                  Discord (recommandé)
                </label>
                <input
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="w-full rounded border border-metal bg-black px-4 py-2 text-white outline-none focus:border-redlake"
                  placeholder="@pseudo"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">
                  Expérience RP *
                </label>
                <textarea
                  required
                  rows={4}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded border border-metal bg-black px-4 py-2 text-white outline-none focus:border-redlake"
                  placeholder="Minecraft RP, SCP, DarkRP, staff, build..."
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">
                  Motivation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full rounded border border-metal bg-black px-4 py-2 text-white outline-none focus:border-redlake"
                  placeholder="Pourquoi rejoindre REDLAKES avant l'ouverture ?"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-redlake/30"
              >
                {authenticated ? "Soumettre la candidature" : "Se connecter pour soumettre"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default function CandidaturesPage() {
  return (
    <Suspense>
      <CandidaturesForm />
    </Suspense>
  );
}
