"use client";

import { Award, Clock, ShieldAlert, Star } from "lucide-react";
import { useCoreShell } from "@/components/core/CoreShellProvider";

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded border border-metal/40 bg-black/30 p-3">
      <Icon className="mb-2 h-4 w-4 text-gray-500" />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wide text-gray-600">{label}</p>
    </div>
  );
}

export function ProfileApp() {
  const { session } = useCoreShell();
  const character = session.character;

  if (!character) {
    return (
      <p className="text-sm text-gray-500">
        Aucun personnage actif — activez-en un depuis votre tableau de bord.
      </p>
    );
  }

  const hours = Math.floor(character.playtime / 60);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-gray-600">{session.vocab.label}</p>
        <h2 className="text-xl font-bold text-white">{session.displayName}</h2>
        <p className="text-sm text-gray-500">
          {character.grade}
          {character.gradeInfo?.departmentRef && ` — ${character.gradeInfo.departmentRef.name}`}
          {character.teamName && ` — Équipe ${character.teamName}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Clock} label="Heures RP" value={hours} />
        <StatTile icon={Star} label="Réputation" value={character.reputation} />
        <StatTile icon={ShieldAlert} label="Sanctions" value={character.sanctions} />
        <StatTile icon={Award} label="Médailles" value={character.medals.length} />
      </div>

      {character.medals.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-gray-600">
            Distinctions
          </p>
          <div className="flex flex-wrap gap-2">
            {character.medals.map((m) => (
              <span
                key={m}
                className="rounded border border-redlake/30 bg-redlake/10 px-2 py-1 text-xs text-gray-300"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {session.staffRank && (
        <p className="font-mono text-[10px] text-gray-600">
          Rang staff : {session.staffRank}
        </p>
      )}
    </div>
  );
}
