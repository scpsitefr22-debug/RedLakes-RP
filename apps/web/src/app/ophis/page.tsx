"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Skull, Send, Sparkles } from "lucide-react";
import { type OphisMessage, OPHIS_SUGGESTIONS, OPHIS_GREETING, getOphisResponse } from "@/lib/ophis";

export default function OphisPage() {
  const [messages, setMessages] = useState<OphisMessage[]>([
    { role: "assistant", content: OPHIS_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    const [content] = await Promise.all([
      getOphisResponse(userMsg),
      new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600)),
    ]);
    setMessages((m) => [...m, { role: "assistant", content }]);
    setLoading(false);
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
        {OPHIS_SUGGESTIONS.map((q) => (
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
