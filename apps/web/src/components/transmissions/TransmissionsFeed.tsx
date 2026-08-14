"use client";

import { useMemo, useState } from "react";
import {
  Radio,
  Megaphone,
  UserPlus,
  UserMinus,
  Zap,
  FileText,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CLEARANCE_LABELS, type ClearanceLevel } from "@/lib/clearance";
import {
  type Transmission,
  type TransmissionType,
  TRANSMISSION_TYPE_LABELS,
  foundationTimestamp,
} from "@/lib/transmissions";

const TYPE_ICONS: Record<TransmissionType, typeof Radio> = {
  MESSAGE: Radio,
  ANNOUNCE: Megaphone,
  MEMBER_JOIN: UserPlus,
  MEMBER_LEAVE: UserMinus,
  EVENT: FileText,
  BOOST: Zap,
};

function clampLevel(n: number): ClearanceLevel {
  return Math.min(Math.max(Math.round(n), 1), 5) as ClearanceLevel;
}

export function TransmissionsFeed({
  transmissions,
  playerClearance,
  authenticated = false,
}: {
  transmissions: Transmission[];
  playerClearance?: ClearanceLevel;
  authenticated?: boolean;
}) {
  const [simulatedLevel, setSimulatedLevel] = useState<ClearanceLevel>(2);
  const userLevel = playerClearance ?? simulatedLevel;
  const useRealClearance = authenticated && playerClearance !== undefined;

  const accessibleCount = useMemo(
    () => transmissions.filter((t) => userLevel >= clampLevel(t.clearance)).length,
    [transmissions, userLevel],
  );

  return (
    <div className="space-y-8">
      <div className="hologram-border rounded-lg p-6">
        {useRealClearance ? (
          <>
            <p className="mb-2 font-mono text-sm text-gray-500">
              Habilitation dérivée de votre grade :
            </p>
            <p className="font-mono text-lg font-bold text-redlake-glow">
              Niveau {userLevel} — {CLEARANCE_LABELS[userLevel]}
            </p>
            <p className="mt-2 font-mono text-xs text-gray-600">
              Les transmissions au-dessus de votre niveau restent expurgées.
            </p>
          </>
        ) : (
          <>
            <p className="mb-4 font-mono text-sm text-gray-500">
              Simuler le niveau d&apos;habilitation (visiteur non connecté) :
            </p>
            <div className="flex flex-wrap gap-2">
              {([1, 2, 3, 4, 5] as ClearanceLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setSimulatedLevel(level)}
                  className={cn(
                    "rounded border px-4 py-2 font-mono text-sm transition-colors",
                    simulatedLevel === level
                      ? "border-redlake bg-redlake/20 text-redlake-glow"
                      : "border-metal text-gray-500 hover:text-white",
                  )}
                >
                  Niveau {level}
                </button>
              ))}
            </div>
            <p className="mt-4 font-mono text-xs text-gray-600">
              Actuel : {CLEARANCE_LABELS[simulatedLevel]}
            </p>
          </>
        )}
      </div>

      {transmissions.length === 0 ? (
        <div className="hologram-border rounded-lg p-8 text-center text-gray-500">
          <Radio className="mx-auto mb-3 h-6 w-6 text-redlake-glow" />
          <p>
            Aucune transmission enregistrée pour le moment. Le relais s&apos;active
            dès que le bot du Site-12 capte une activité sur les canaux surveillés.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-4 border-l border-redlake/20 pl-6">
          {transmissions.map((t) => {
            const required = clampLevel(t.clearance);
            const accessible = userLevel >= required;
            const Icon = TYPE_ICONS[t.type] ?? Radio;

            return (
              <li key={t.id} className="relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-redlake/40 bg-black">
                  <Icon className="h-3 w-3 text-redlake-glow" />
                </span>

                <div
                  className={cn(
                    "rounded-lg border p-5 transition-all",
                    accessible
                      ? "border-redlake/30 bg-redlake/5"
                      : "border-metal/30 bg-metal/10 opacity-70",
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded border border-redlake/30 bg-redlake/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-redlake-glow">
                      {TRANSMISSION_TYPE_LABELS[t.type]}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                      {t.channelLabel}
                    </span>
                    <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-gray-600">
                      {accessible ? (
                        <Unlock className="h-3 w-3 text-green-400/70" />
                      ) : (
                        <Lock className="h-3 w-3 text-red-400/70" />
                      )}
                      Niv. {required}
                    </span>
                  </div>

                  <h3 className="font-bold text-white">
                    {accessible ? t.title : "████████ — ACCÈS REFUSÉ"}
                  </h3>

                  {accessible ? (
                    <>
                      <p className="mt-1 text-sm text-gray-400">{t.body}</p>
                      {t.excerpt && (
                        <blockquote className="mt-3 border-l-2 border-redlake/40 bg-black/30 px-3 py-2 font-mono text-xs text-gray-400">
                          {t.excerpt}
                        </blockquote>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-gray-600">
                        <span>EXP. {t.codename}</span>
                        {t.authorDisplay && (
                          <span className="text-gray-500">@{t.authorDisplay}</span>
                        )}
                        <span>{foundationTimestamp(t.occurredAt)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="mt-1 font-mono text-sm text-red-400/60">
                      [DONNÉES EXPURGÉES] Habilitation de niveau {required} requise.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex items-center gap-2 font-mono text-xs text-gray-600">
        <FileText className="h-4 w-4" />
        {accessibleCount} / {transmissions.length} transmissions accessibles à votre
        niveau
      </div>
    </div>
  );
}
