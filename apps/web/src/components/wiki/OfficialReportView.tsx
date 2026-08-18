"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";

interface ReportAddendum {
  author: string;
  content?: string;
  redacted?: boolean;
}

interface Props {
  number: string;
  scpClass: string;
  containment: string;
  description: string;
  history: string;
  addendums: ReportAddendum[];
}

/**
 * Rendu clinique classique (gabarit officiel SCP) affiche directement sur le
 * site, pense pour etre capture en screenshot et partage (Discord, etc.) —
 * ce n'est pas un export imprimable ou telechargeable.
 */
export function OfficialReportView({
  number,
  scpClass,
  containment,
  description,
  history,
  addendums,
}: Props) {
  const [open, setOpen] = useState(false);
  const reportId = number.replace("SCP-", "");

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded border border-metal px-3 py-1.5 font-mono text-xs text-gray-400 transition-colors hover:border-redlake hover:text-white"
      >
        {open ? <X className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
        {open ? "Fermer le rapport officiel" : "Vue rapport officiel"}
      </button>

      {open && (
        <div className="mt-4 rounded border border-metal bg-[#0b0b0b] p-8 font-mono text-sm leading-relaxed text-gray-300">
          <p>
            <span className="text-gray-500">ID DU RAPPORT :</span> {number}
          </p>
          <p className="mt-1">
            <span className="text-gray-500">CLASSE DE L&apos;OBJET :</span> {scpClass}
          </p>

          <p className="mt-6 font-bold text-white">PROCÉDURES DE CONFINEMENT SPÉCIALES :</p>
          <p className="mt-1 whitespace-pre-line">{containment}</p>

          <p className="mt-6 font-bold text-white">DESCRIPTION :</p>
          <p className="mt-1 whitespace-pre-line">{description}</p>

          <p className="mt-6 font-bold text-white">
            ADDENDUM {reportId}.1 : DÉCOUVERTE
          </p>
          <p className="mt-1 whitespace-pre-line">{history}</p>

          {addendums.map((a, i) =>
            a.redacted ? (
              <div key={i}>
                <p className="mt-6 font-bold text-white">
                  ADDENDUM {reportId}.{i + 2} : {a.author.toUpperCase()}
                </p>
                <p className="mt-1 text-gray-600">
                  [CONTENU CLASSIFIÉ — HABILITATION INSUFFISANTE]
                </p>
              </div>
            ) : a.content ? (
              <div key={i}>
                <p className="mt-6 font-bold text-white">
                  ADDENDUM {reportId}.{i + 2} : {a.author.toUpperCase()}
                </p>
                <p className="mt-1 whitespace-pre-line">{a.content}</p>
              </div>
            ) : null
          )}

          <p className="mt-8 text-[10px] text-gray-600">
            Document généré depuis les archives Site-12 — REDLAKES RP.
          </p>
        </div>
      )}
    </div>
  );
}
