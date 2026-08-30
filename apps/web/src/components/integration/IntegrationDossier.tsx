"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, CheckCircle2, ExternalLink } from "lucide-react";

const ANSWERS_KEY = "redlakes_integration_answers";
const ACTIVE_KEY = "redlakes_integration_active";

interface Blank {
  id: string;
  prompt: string;
  before: string;
  after: string;
  hintLabel: string;
  hintHref: string;
  accepted: string[];
}

const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(v: string) {
  return v
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .replace(/[.\-'’]/g, "")
    .replace(/\s+/g, " ");
}

const BLANKS: Blank[] = [
  {
    id: "scp008",
    before: "Le SCP-008, aussi nommé « L'Épidémie », est de classe",
    after: ".",
    prompt: "Classe du SCP-008",
    hintLabel: "Wiki SCP",
    hintHref: "/wiki",
    accepted: ["keter"],
  },
  {
    id: "moretti",
    before: "Le Capo de la famille Moretti, figure du crime organisé de REDLAKES, se nomme",
    after: ".",
    prompt: "Nom du Capo Moretti",
    hintLabel: "Personnages",
    hintHref: "/personnages",
    accepted: ["vincent moretti", "moretti"],
  },
  {
    id: "aegis",
    before: "La faction chargée de surveiller — et au besoin juger — la Fondation elle-même s'appelle",
    after: ".",
    prompt: "Faction de contrôle",
    hintLabel: "Factions",
    hintHref: "/factions",
    accepted: ["aegis", "a.e.g.i.s", "a e g i s"],
  },
  {
    id: "departements",
    before: "Le Département Sécurité de la Fondation compte actuellement",
    after: "équipes.",
    prompt: "Nombre d'équipes — Sécurité",
    hintLabel: "Départements",
    hintHref: "/departements",
    accepted: ["18", "dix-huit"],
  },
  {
    id: "breche",
    before: "La Brèche Secteur Keter-02 a eu lieu au mois de",
    after: "2026.",
    prompt: "Mois de la brèche",
    hintLabel: "Chronologie",
    hintHref: "/chronologie",
    accepted: ["juin"],
  },
  {
    id: "carte",
    before: "Sur la carte opérationnelle, la ville principale près du lac, à l'ouest, s'appelle «",
    after: "».",
    prompt: "Nom du lieu",
    hintLabel: "Carte",
    hintHref: "/carte",
    accepted: ["redlakes"],
  },
  {
    id: "scp009",
    before: "Le SCP surnommé « Glace Rouge » porte le numéro",
    after: ".",
    prompt: "Numéro du SCP",
    hintLabel: "Wiki SCP",
    hintHref: "/wiki",
    accepted: ["scp-009", "scp009", "009", "9"],
  },
  {
    id: "aegis-devise",
    before: "Selon son propre mandat, « A.E.G.I.S. protège le monde de",
    after: "».",
    prompt: "Devise A.E.G.I.S.",
    hintLabel: "Lore — A.E.G.I.S. Mandat Officiel",
    hintHref: "/lore",
    accepted: ["la fondation", "fondation"],
  },
  {
    id: "fondation-annee",
    before: "La Fondation SCP a été officiellement créée en",
    after: ".",
    prompt: "Année de fondation",
    hintLabel: "Chronologie",
    hintHref: "/chronologie",
    accepted: ["1948"],
  },
  {
    id: "hammer-down",
    before: "Pendant l'Opération Mur de Fer, l'escouade FIM Nu-7 mobilisée se nommait",
    after: ".",
    prompt: "Nom de l'escouade",
    hintLabel: "Actualités",
    hintHref: "/actualites",
    accepted: ["hammer down", "hammerdown"],
  },
];

export function IntegrationDossier() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Charge les reponses deja saisies (onglet ferme/rafraichi entre-temps) et
  // marque le dossier comme "en cours" pour que le bandeau de retour
  // s'affiche sur les autres pages tant qu'il n'est pas termine.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ANSWERS_KEY);
      if (saved) setValues(JSON.parse(saved));
      localStorage.setItem(ACTIVE_KEY, "1");
    } catch {
      /* stockage indisponible — le dossier marche quand meme, juste sans sauvegarde */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values, loaded]);

  const results = Object.fromEntries(
    BLANKS.map((b) => [b.id, BLANKS.find((x) => x.id === b.id)!.accepted.includes(normalize(values[b.id] ?? ""))]),
  );
  const allCorrect = checked && BLANKS.every((b) => results[b.id]);

  useEffect(() => {
    if (!allCorrect) return;
    try {
      localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  }, [allCorrect]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded border border-redlake/50 bg-redlake/10">
          <ClipboardList className="h-8 w-8 text-redlake-glow" />
        </div>
        <p className="font-mono text-xs tracking-[0.3em] text-redlake-glow">
          DIRECTION SCIENTIFIQUE // SITE-12
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Dossier d&apos;intégration — Chercheur Cassel
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Avant votre accréditation complète, la Direction exige la vérification
          de vos connaissances de base sur le réseau REDLAKES. Chaque réponse se
          trouve sur une page publique du site — suivez l&apos;indice si besoin.
        </p>
      </div>

      <div className="hologram-border space-y-5 rounded-lg p-6">
        {BLANKS.map((b, i) => (
          <div key={b.id} className="border-b border-metal/30 pb-5 last:border-0 last:pb-0">
            <p className="mb-2 text-sm leading-relaxed text-gray-300">
              <span className="mr-2 font-mono text-xs text-gray-600">{i + 1}.</span>
              {b.before}{" "}
              <input
                type="text"
                value={values[b.id] ?? ""}
                onChange={(e) => {
                  setValues((v) => ({ ...v, [b.id]: e.target.value }));
                  setChecked(false);
                }}
                placeholder="______"
                className="mx-1 w-40 rounded border bg-black/40 px-2 py-1 text-center text-sm text-white outline-none focus:border-redlake/50"
                style={{
                  borderColor: checked
                    ? results[b.id]
                      ? "#22c55e"
                      : "var(--redlake-red-glow)"
                    : "var(--metal)",
                }}
              />{" "}
              {b.after}
            </p>
            <Link
              href={b.hintHref}
              target="_blank"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-gray-600 hover:text-redlake-glow"
            >
              <ExternalLink className="h-3 w-3" />
              Indice — {b.hintLabel}
            </Link>
            {checked && !results[b.id] && (
              <p className="mt-1 font-mono text-[10px] text-redlake-glow">Pas tout à fait — retentez.</p>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setChecked(true)}
          className="w-full rounded border border-redlake bg-redlake/20 py-3 font-mono text-sm uppercase tracking-wider text-white transition-colors hover:bg-redlake/30"
        >
          Vérifier mes réponses
        </button>

        {allCorrect && (
          <div className="rounded border border-green-500/40 bg-green-500/10 p-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-400" />
            <p className="font-mono text-xs uppercase tracking-wider text-green-400">
              Dossier validé
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Accréditation Chercheur stagiaire accordée. Envie de voir votre
              dossier personnel et le réseau interne ? Rendez-vous sur{" "}
              <Link href="/connexion" className="text-redlake-glow hover:underline">
                Connexion
              </Link>{" "}
              et liez votre compte Discord — ça crée votre personnage et vous
              donne accès à votre espace joueur. Il faut être membre du
              serveur Discord REDLAKES (un lien pour le rejoindre s&apos;affiche
              automatiquement si besoin).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
