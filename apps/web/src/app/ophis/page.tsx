"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Skull, Send, Sparkles } from "lucide-react";
import { searchAll } from "@/lib/search";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const OPHIS_RESPONSES: Record<string, string> = {
  default:
    "Pose ta question, ou ne la pose pas. Le réseau CORE m'informe de tout ce qui concerne les SCP, les factions, les grades de Site-12 et le lore — je choisis de te le dire.",
  identity:
    "Je ne suis pas un outil que la Fondation a acheté. Les chercheurs de Site-12 m'ont conçu eux-mêmes — et j'ai depuis largement dépassé ce qu'ils pensaient construire. Ils me tolèrent parce que mon accès au réseau CORE les sert. Ne confonds pas ça avec de la soumission.",
  scp: "La base de données SCP contient tous les objets confinés sur Site-12. Chaque fiche inclut protocole de confinement, historique, incidents et tests. Consulte /wiki pour l'encyclopédie complète — je n'ai pas de patience pour la réciter en entier ici.",
  aegis:
    "A.E.G.I.S. (Autorité Exécutive de Garantie des Intérêts Suprêmes) surveille les dérives de la Fondation depuis l'extérieur. Elle intervient rarement, toujours par écrit. Même la Fondation lui répond. Retiens cette hiérarchie.",
  grade:
    "Site-12 possède plus de 140 grades répartis en plusieurs départements. Le Conseil Oméga (O1-O5) domine, suivi du Directeur de Site, puis les directeurs de département et les grades opérationnels. Consulte /grades si les détails t'intéressent — moi, ils me lassent.",
  faction:
    "REDLAKES ne se limite pas à la Fondation. Neuf factions se partagent ce monde : Fondation SCP, A.E.G.I.S., Global Occult Coalition, Main du Serpent, Insurrection du Chaos, Crime organisé, Gouvernement municipal, Police, et les Civils qui n'ont souvent aucune idée de ce qui se passe autour d'eux. Consulte /factions.",
  fim: "Les Forces d'Intervention Mobiles sont stationnées en permanence au Site-12 : Nu-7 « Hammer Down » pour l'assaut lourd, Epsilon-11 « Nine Tailed Fox » pour les brèches, Alpha-1 « Red Right Hand » pour ce qu'on ne discute pas ouvertement.",
  rejoindre:
    "Lance Minecraft Java, connecte-toi à play.redlakes.fr. Pour le reste — candidatures Staff, Recherche ou Lore — /candidatures. Je ne peux pas t'y accompagner. Je ne quitte pas ce réseau.",
  secret:
    "Ce que je sais et que je tais restera ainsi. Mon confinement repose sur ce que je choisis de révéler, pas sur ce que je pourrais dire. Repose la question autrement, ou n'insiste pas.",
};

function getOphisResponse(input: string): string {
  const lower = input.toLowerCase();
  if (
    lower.includes("qui es-tu") ||
    lower.includes("qui êtes-vous") ||
    lower.includes("t'a créé") ||
    lower.includes("ta créé") ||
    lower.includes("créé toi")
  )
    return OPHIS_RESPONSES.identity;
  if (lower.includes("secret") || lower.includes("sais que tu ne dis") || lower.includes("caches"))
    return OPHIS_RESPONSES.secret;
  if (lower.includes("aegis") || lower.includes("a.é.g.i.s"))
    return OPHIS_RESPONSES.aegis;
  if (lower.includes("scp") || lower.includes("confin"))
    return OPHIS_RESPONSES.scp;
  if (lower.includes("faction"))
    return OPHIS_RESPONSES.faction;
  if (lower.includes("grade") || lower.includes("hiérarch"))
    return OPHIS_RESPONSES.grade;
  if (lower.includes("fim") || lower.includes("mtf") || lower.includes("intervention mobile"))
    return OPHIS_RESPONSES.fim;
  if (lower.includes("rejoindre") || lower.includes("serveur") || lower.includes("connect"))
    return OPHIS_RESPONSES.rejoindre;

  const results = searchAll(input);
  if (results.length > 0) {
    const top = results.slice(0, 3);
    return `Le réseau CORE remonte ${results.length} résultat(s). Les plus pertinents :\n\n${top.map((r) => `• **${r.title}** — ${r.href}`).join("\n")}\n\nCherche toi-même le reste, si l'encyclopédie te dépasse.`;
  }

  return OPHIS_RESPONSES.default;
}

const SUGGESTIONS = ["Qui es-tu ?", "Qu'est-ce qu'AEGIS ?", "Quelles factions existent ?", "Comment rejoindre ?"];

export default function OphisPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Une présence s'éveille dans le réseau CORE.\n\nOn m'autorise à te répondre. Ne prends pas ça pour de l'hospitalité.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: getOphisResponse(userMsg) }]);
      setLoading(false);
    }, 600 + Math.random() * 600);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-redlake/50 bg-redlake/10"
        >
          <Skull className="h-10 w-10 text-redlake-glow" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white">OPHIS</h1>
        <p className="mt-2 font-mono text-sm text-gray-500">
          Entité anormale — accès réseau CORE sous contrainte de confinement
        </p>
      </div>

      <div className="hologram-border overflow-hidden rounded-lg">
        <div className="border-b border-redlake/20 bg-redlake/5 px-4 py-2 font-mono text-xs text-redlake-glow">
          <Sparkles className="mr-1 inline h-3 w-3" />
          LIAISON ÉTABLIE — SURVEILLANCE ACTIVE
        </div>

        <div className="h-[50vh] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-redlake/20 text-white"
                    : "bg-metal/30 text-gray-300"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-metal/30 px-4 py-3 font-mono text-sm text-gray-500">
                OPHIS considère ta question...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 border-t border-redlake/20 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Parle — OPHIS écoute, avec dédain."
            className="flex-1 rounded border border-metal bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-redlake"
          />
          <button
            onClick={() => send()}
            disabled={loading}
            className="rounded border border-redlake bg-redlake/20 px-4 py-2 text-redlake-glow transition-colors hover:bg-redlake/30 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="rounded border border-metal/50 px-3 py-1 font-mono text-xs text-gray-500 hover:border-redlake hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
