"use client";

import { useMemo, useState } from "react";
import { Radio, Megaphone, UserPlus, UserMinus, Zap, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLEARANCE_LABELS, clearanceBadgeClass, type ClearanceLevel } from "@/lib/clearance";
import { type Transmission, type TransmissionType, TRANSMISSION_TYPE_LABELS } from "@/lib/transmissions";
import { EmptyState } from "@/components/ui/EmptyState";

const TYPE_ICONS: Record<TransmissionType, typeof Radio> = {
  MESSAGE: Radio,
  ANNOUNCE: Megaphone,
  MEMBER_JOIN: UserPlus,
  MEMBER_LEAVE: UserMinus,
  EVENT: FileText,
  BOOST: Zap,
};

/** Couleur de chaque type de transmission (pastille et liseré). */
const TYPE_HEX: Record<TransmissionType, string> = {
  MESSAGE: "#9ca3af",
  ANNOUNCE: "#e5392f",
  MEMBER_JOIN: "#4ade80",
  MEMBER_LEAVE: "#fb923c",
  EVENT: "#facc15",
  BOOST: "#c084fc",
};

function clampLevel(n: number): ClearanceLevel {
  return Math.min(Math.max(Math.round(n), 1), 5) as ClearanceLevel;
}

function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "—", time: "—" };
  return {
    date: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d),
    time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(d),
  };
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
    <div className="space-y-6">
      <div className="panel-flat flex flex-wrap items-center justify-between gap-4 p-4">
        {useRealClearance ? (
          <div>
            <p className="label-mono text-[10px] text-gray-500">Votre habilitation (selon votre grade)</p>
            <p className="mt-1 flex items-center gap-2">
              <span className={cn("label-mono border px-1.5 py-0.5 text-[10px]", clearanceBadgeClass(userLevel))}>
                Niv. {userLevel}
              </span>
              <span className="text-gray-200">{CLEARANCE_LABELS[userLevel]}</span>
            </p>
          </div>
        ) : (
          <div>
            <p className="label-mono text-[10px] text-gray-500">Simuler une habilitation (visiteur)</p>
            <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Niveau simulé">
              {([1, 2, 3, 4, 5] as ClearanceLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSimulatedLevel(level)}
                  aria-pressed={simulatedLevel === level}
                  className={cn(
                    "border px-3 py-1.5 text-sm tabular-nums transition-colors",
                    simulatedLevel === level ? "border-white/60 bg-white/10 text-white" : "border-line text-gray-400 hover:text-white",
                  )}
                >
                  Niv. {level}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="text-right">
          <span className="font-display text-3xl font-extrabold tabular-nums text-white">
            {accessibleCount}
            <span className="text-gray-600"> / {transmissions.length}</span>
          </span>
          <span className="label-mono block text-[10px] text-gray-500">Transmissions lisibles</span>
        </p>
      </div>

      {transmissions.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="Aucune transmission captée"
          hint="Le relais s'active dès que le bot du Site-12 capte une activité sur les canaux surveillés."
        />
      ) : (
        <ol className="border-t border-line">
          {transmissions.map((t) => {
            const required = clampLevel(t.clearance);
            const accessible = userLevel >= required;
            const Icon = TYPE_ICONS[t.type] ?? Radio;
            const color = TYPE_HEX[t.type] ?? "#9ca3af";
            const when = stamp(t.occurredAt);

            return (
              <li
                key={t.id}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b border-line py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
              >
                <div className="font-mono text-xs tabular-nums text-gray-500">
                  <p className="text-sm text-gray-300">{when.time}</p>
                  <p>{when.date}</p>
                </div>
                <div className={cn("min-w-0 border-l-2 pl-4", !accessible && "opacity-70")} style={{ borderColor: accessible ? color : "#374151" }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="label-mono inline-flex items-center gap-1.5 text-[10px]" style={{ color }}>
                      <Icon className="h-3.5 w-3.5" />
                      {TRANSMISSION_TYPE_LABELS[t.type]}
                    </span>
                    <span className="label-mono text-[10px] text-gray-500">{t.channelLabel}</span>
                    <span className={cn("label-mono ml-auto border px-1.5 py-0.5 text-[9px]", clearanceBadgeClass(required))}>
                      Niv. {required}
                    </span>
                  </div>

                  {accessible ? (
                    <>
                      <h3 className="mt-2 font-semibold text-white">{t.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-400">{t.body}</p>
                      {t.excerpt && (
                        <blockquote className="mt-3 border-l-2 border-line-strong bg-black/30 px-3 py-2 font-mono text-xs text-gray-300">
                          {t.excerpt}
                        </blockquote>
                      )}
                      <p className="label-mono mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
                        <span>Exp. {t.codename}</span>
                        {t.authorDisplay && <span>@{t.authorDisplay}</span>}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                        <Lock className="h-3.5 w-3.5 shrink-0" />
                        Transmission expurgée — habilitation de niveau {required} requise.
                      </p>
                      <span className="mt-2 block h-3 w-3/4 bg-gray-700/60" aria-hidden />
                      <span className="mt-1.5 block h-3 w-1/2 bg-gray-700/60" aria-hidden />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
