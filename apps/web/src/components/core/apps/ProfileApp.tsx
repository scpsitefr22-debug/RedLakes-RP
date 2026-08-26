"use client";

import { Award, Clock, ShieldAlert, Star } from "lucide-react";
import { useCoreShell } from "@/components/core/CoreShellProvider";
import { JargonTooltip } from "@/components/ui/JargonTooltip";
import type { GlossaryTerm } from "@/lib/glossary";

function StatTile({
  icon: Icon,
  label,
  value,
  tooltip,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  tooltip?: GlossaryTerm;
}) {
  return (
    <div className="rounded border border-metal/40 bg-black/30 p-3">
      <Icon className="mb-2 h-4 w-4 text-gray-500" />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wide text-gray-600">
        {label}
        {tooltip && <JargonTooltip term={tooltip} />}
      </p>
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
        <p className="flex flex-wrap items-center gap-x-1 text-sm text-gray-500">
          <span>{character.grade}</span>
          <JargonTooltip term="grade" />
          {character.gradeInfo?.departmentRef && (
            <>
              <span>— {character.gradeInfo.departmentRef.name}</span>
              <JargonTooltip term="departement" />
            </>
          )}
          {character.teamName && (
            <>
              <span>— Équipe {character.teamName}</span>
              <JargonTooltip term="equipe" />
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Clock} label="Heures RP" value={hours} />
        <StatTile icon={Star} label="Réputation" value={character.reputation} tooltip="reputation" />
        <StatTile icon={ShieldAlert} label="Sanctions" value={character.sanctions} tooltip="sanction" />
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
