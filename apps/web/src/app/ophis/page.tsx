"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Skull, Send, Sparkles, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Qui es-tu ?",
  "Qu'est-ce qu'AEGIS ?",
  "Comment rejoindre le site ?",
  "Que sais-tu que tu ne dis pas ?",
];

export default function OphisPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Une présence s'éveille dans le réseau CORE.\n\nOn m'autorise à te répondre. Ne prends pas ça pour de l'hospitalité.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ authenticated: boolean }>("/auth/me")
      .then((res) => {
        setAuthed(res.authenticated);
        if (!res.authenticated) router.replace("/connexion?redirect=/ophis");
      })
      .catch(() => router.replace("/connexion?redirect=/ophis"))
      .finally(() => setChecking(false));
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setError("");
    const nextMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await apiFetch<{ reply: string }>("/ophis/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userMsg,
          history: nextMessages.slice(-10),
        }),
      });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "OPHIS ne répond pas — le lien avec le réseau CORE a échoué.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking || !authed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-mono text-gray-500">
        <Lock className="mr-2 h-4 w-4" /> Vérification d&apos;accès...
      </div>
    );
  }

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

        {error && (
          <p className="border-t border-red-400/30 bg-red-400/10 px-4 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-2 border-t border-redlake/20 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Parle — OPHIS écoute, avec dédain."
            maxLength={500}
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
            disabled={loading}
            className="rounded border border-metal/50 px-3 py-1 font-mono text-xs text-gray-500 hover:border-redlake hover:text-white disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
