"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import { searchAll } from "@/lib/search";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CASSIE_RESPONSES: Record<string, string> = {
  default:
    "Je suis CASSIE, l'assistant d'intelligence artificielle de REDLAKES. Posez-moi des questions sur les SCP, les factions, les grades Site-12 ou le lore.",
  scp: "La base de données SCP contient tous les objets confinés sur Site-12. Chaque fiche inclut protocole de confinement, historique, incidents et tests. Consultez /wiki pour l'encyclopédie complète.",
  aegis:
    "A.E.G.I.S. (Autorité Exécutive de Garantie des Intérêts Suprêmes) est une instance supranationale qui contrôle les dérives de la Fondation. Elle intervient rarement, toujours par rapports écrits. « La Fondation protège l'humanité. AEGIS décide jusqu'où elle a le droit d'aller. »",
  grade:
    "Site-12 possède plus de 70 grades répartis en 4 départements. Le Conseil Oméga (O1-O5) domine la hiérarchie, suivi du Directeur de Site (10 000$), puis les directeurs de département et les grades opérationnels.",
  fim: "Les FIM (Forces d'Intervention Mobiles) sont stationnées en permanence au Site-12, sous l'autorité du Directeur de la Sécurité : Nu-7 « Hammer Down » pour l'assaut lourd, Epsilon-11 « Nine Tailed Fox » pour les brèches, Alpha-1 « Red Right Hand » pour les opérations classifiées.",
  rejoindre:
    "Pour rejoindre REDLAKES RP, lancez Minecraft Java et connectez-vous à play.redlakes.fr. Consultez les candidatures pour Staff, Recherche ou Lore sur /candidatures.",
};

function getCassieResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("aegis") || lower.includes("a.é.g.i.s")) return CASSIE_RESPONSES.aegis;
  if (lower.includes("scp") || lower.includes("confin")) return CASSIE_RESPONSES.scp;
  if (lower.includes("grade") || lower.includes("site-12") || lower.includes("hiérarch"))
    return CASSIE_RESPONSES.grade;
  if (lower.includes("fim") || lower.includes("mtf") || lower.includes("intervention mobile"))
    return CASSIE_RESPONSES.fim;
  if (lower.includes("rejoindre") || lower.includes("serveur") || lower.includes("connect"))
    return CASSIE_RESPONSES.rejoindre;

  const results = searchAll(input);
  if (results.length > 0) {
    const top = results.slice(0, 3);
    return `J'ai trouvé ${results.length} résultat(s). Voici les plus pertinents :\n\n${top.map((r) => `• **${r.title}** — ${r.href}`).join("\n")}\n\nExplorez l'encyclopédie pour plus de détails.`;
  }

  return CASSIE_RESPONSES.default;
}

export default function CassiePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "CASSIE en ligne. Système d'intelligence artificielle REDLAKES — Site-12.\n\nComment puis-je vous assister ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: getCassieResponse(userMsg) },
      ]);
      setLoading(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-redlake/50 bg-redlake/10"
        >
          <Bot className="h-10 w-10 text-redlake-glow" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white">CASSIE</h1>
        <p className="mt-2 font-mono text-sm text-gray-500">
          Cognitive Assistant for SCP Site Intelligence & Encyclopedia
        </p>
      </div>

      <div className="hologram-border overflow-hidden rounded-lg">
        <div className="border-b border-redlake/20 bg-redlake/5 px-4 py-2 font-mono text-xs text-redlake-glow">
          <Sparkles className="mr-1 inline h-3 w-3" />
          INTERFACE HOLOGRAPHIQUE — CONNEXION SÉCURISÉE
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
                CASSIE analyse...
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
            placeholder="Posez une question sur le lore, les SCP, les grades..."
            className="flex-1 rounded border border-metal bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-redlake"
          />
          <button
            onClick={send}
            disabled={loading}
            className="rounded border border-redlake bg-redlake/20 px-4 py-2 text-redlake-glow transition-colors hover:bg-redlake/30 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["Qu'est-ce qu'AEGIS ?", "Grades Site-12", "FIM disponibles", "Comment rejoindre ?"].map(
          (q) => (
            <button
              key={q}
              onClick={() => {
                setInput(q);
              }}
              className="rounded border border-metal/50 px-3 py-1 font-mono text-xs text-gray-500 hover:border-redlake hover:text-white"
            >
              {q}
            </button>
          )
        )}
      </div>
    </div>
  );
}
