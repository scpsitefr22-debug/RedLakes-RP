"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Skull } from "lucide-react";
import { type OphisMessage, OPHIS_SUGGESTIONS, OPHIS_GREETING, getOphisResponse } from "@/lib/ophis";

export function OphisApp() {
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
      new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 400)),
    ]);
    setMessages((m) => [...m, { role: "assistant", content }]);
    setLoading(false);
  };

  return (
    <div className="flex h-[55vh] flex-col">
      <div className="mb-3 flex items-center gap-2 text-gray-500">
        <Skull className="h-4 w-4" />
        <p className="font-mono text-[10px]">LIAISON ÉTABLIE — SURVEILLANCE ACTIVE</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user" ? "bg-redlake/20 text-white" : "bg-metal/30 text-gray-300"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-metal/30 px-3 py-2 font-mono text-xs text-gray-500">
              OPHIS considère ta question...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {OPHIS_SUGGESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="rounded border border-metal/50 px-2 py-1 font-mono text-[10px] text-gray-500 hover:border-redlake hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-2 border-t border-metal/40 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Parle — OPHIS écoute, avec dédain."
          className="flex-1 rounded border border-metal bg-black px-3 py-2 text-sm text-white outline-none focus:border-redlake"
        />
        <button
          onClick={() => send()}
          disabled={loading}
          className="rounded border border-redlake bg-redlake/20 px-3 py-2 text-redlake-glow transition-colors hover:bg-redlake/30 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
