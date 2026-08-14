"use client";

import { motion } from "framer-motion";
import { timelineEvents } from "@/data/timeline";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const typeColors: Record<string, string> = {
  fondation: "border-blue-400/30 bg-blue-400/10",
  incident: "border-yellow-400/30 bg-yellow-400/10",
  guerre: "border-red-400/30 bg-red-400/10",
  breach: "border-orange-400/30 bg-orange-400/10",
  faction: "border-purple-400/30 bg-purple-400/10",
};

export function TimelinePreview() {
  const preview = timelineEvents.slice(0, 6);

  return (
    <section className="border-y border-redlake/10 bg-classified py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            ARCHIVES TEMPORELLES
          </p>
          <h2 className="text-3xl font-bold text-white">Chronologie</h2>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-redlake/50 via-redlake/20 to-transparent md:block" />

          <div className="space-y-8">
            {preview.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-4`}
              >
                <div className={`w-full md:w-[45%] ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className={`hologram-border inline-block rounded-lg p-4 ${i % 2 === 0 ? "md:ml-auto" : ""}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-redlake-glow">
                        {event.year}
                      </span>
                      <Badge className={typeColors[event.type]}>{event.type}</Badge>
                    </div>
                    <h3 className="mb-1 font-bold text-white">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.description}</p>
                  </div>
                </div>
                <div className="hidden h-4 w-4 rounded-full border-2 border-redlake-glow bg-black md:block" />
                <div className="hidden w-[45%] md:block" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/chronologie"
            className="font-mono text-sm text-redlake-glow hover:underline"
          >
            Voir la chronologie complète →
          </Link>
        </div>
      </div>
    </section>
  );
}
