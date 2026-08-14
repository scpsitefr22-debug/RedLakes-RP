import { useState } from "react";
import type { GlobalNarrativeSave } from "@redlakes/narrative-core";
import {
  getPlayerDisplayName,
  interpolateNarrativeText,
  isEmailRead,
  markEmailsRead,
} from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  preview: string;
  body: string;
}

function getBaseEmails(gns: GlobalNarrativeSave): Email[] {
  const name = getPlayerDisplayName(gns);
  return [
    {
      id: "e1",
      from: "RH — Terminal",
      subject: `Bienvenue, ${name}`,
      date: "Aujourd'hui 07:42",
      preview: "Votre dossier recrue est disponible. Clearance initiale : 1.",
      body: interpolateNarrativeText(
        "Recrue {player_name},\n\nVotre intégration au Site-12 est effective. Dossier : {employee_id}.\n\nConsultez la messagerie pour vos instructions.\n\n— Système RH automatisé",
        gns
      ),
    },
    {
      id: "e2",
      from: "Sécurité — Site-12",
      subject: "Rappel : protocole communication",
      date: "Aujourd'hui 08:15",
      preview: "Toute fuite d'information classifiée sera traitée comme une violation majeure.",
      body: "Rappel obligatoire.\n\nLes canaux non sécurisés sont surveillés. Les violations entraînent une rétrogradation immédiate.\n\n— Département Sécurité",
    },
  ];
}

function getAct4Emails(gns: GlobalNarrativeSave): Email[] {
  const extra: Email[] = [];
  if (gns.flags.ch1_briefing_nudge && !gns.flags.ch1_briefing_reminder_sent) {
    extra.push({
      id: "e-briefing-nudge",
      from: "Administration — Site-12",
      subject: "Briefing 08h00 — préparation",
      date: "Aujourd'hui 07h30",
      preview: "Vérifiez la messagerie pour la convocation officielle.",
      body: "Le briefing collectif approche. Assurez-vous que votre terminal messagerie est actif.\n\n— Administration Site-12",
    });
  }
  if (gns.flags.ch1_briefing_reminder_sent) {
    extra.push({
      id: "e-briefing",
      from: "Administration — Site-12",
      subject: "Convocation Salle de conférence B",
      date: "Aujourd'hui 07h45",
      preview: "Briefing obligatoire — présence enregistrée par badge.",
      body: "Personnel concerné,\n\nBriefing sécurité et procédures post-brèche.\nLieu : Salle B.\nHeure : 08h00.\n\nAbsence non justifiée = notation dossier.",
    });
  }
  if (gns.flags.ch1_security_review) {
    extra.push({
      id: "e-security",
      from: "Département Sécurité",
      subject: "Entretien obligatoire — demain 14h00",
      date: "Aujourd'hui 09h30",
      preview: "Objet : protocole de remontée d'anomalie.",
      body: "Suite à votre signalement, un entretien est programmé.\n\nPrésence obligatoire.",
    });
  }
  if (gns.flags.ch1_site_rumor_spread) {
    extra.push({
      id: "e-rumor",
      from: "Administration — Site-12",
      subject: "Circulation rumeur interne — rappel",
      date: "Aujourd'hui 10h12",
      preview: "Rumeur non confirmée concernant un inspecteur AEGIS.",
      body: "Personnel Site-12,\n\nUne rumeur circule sur la présence d'un inspecteur AEGIS dans l'aile administrative.\n\nAucune convocation officielle n'a été émise. Ne relayer pas d'informations non vérifiées.\n\n— Administration",
    });
  }
  if (gns.flags.ch1_complete) {
    extra.push({
      id: "e-complete",
      from: "RH — Terminal",
      subject: "Fin de période d'intégration",
      date: "Aujourd'hui 17h00",
      preview: "Semaine 1 terminée. Dossier archivé.",
      body: "Félicitations — votre intégration initiale est complète.\n\nClearance maintenue : niveau 1.",
    });
  }
  return extra;
}

export function EmailApp() {
  const { gns, updateGNS } = useGNSRequired();
  const emails = [...getAct4Emails(gns), ...getBaseEmails(gns)];
  const [selectedId, setSelectedId] = useState(emails[0]?.id ?? "");

  const selected = emails.find((e) => e.id === selectedId) ?? emails[0];

  const selectEmail = (id: string) => {
    setSelectedId(id);
    if (!isEmailRead(gns, id)) {
      updateGNS((g) => markEmailsRead(g, id));
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex w-56 flex-col border-r border-panel-border bg-classified">
        <div className="border-b border-panel-border px-3 py-2 text-[10px] uppercase tracking-wider text-metal">
          Boîte — {emails.length}
        </div>
        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => {
            const read = isEmailRead(gns, email.id);
            const active = selected?.id === email.id;
            return (
              <button
                key={email.id}
                type="button"
                onClick={() => selectEmail(email.id)}
                className={`w-full border-b border-panel-border/50 px-3 py-2.5 text-left transition-colors ${
                  active ? "bg-redlake/10" : "hover:bg-panel"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`truncate text-[11px] ${read ? "text-metal" : "text-foreground font-medium"}`}>
                    {email.from}
                  </span>
                  {!read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-redlake" />}
                </div>
                <div className={`mt-0.5 truncate text-[11px] ${read ? "text-metal/80" : "text-foreground"}`}>
                  {email.subject}
                </div>
                <p className="mt-0.5 truncate text-[9px] text-metal">{email.preview}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {selected ? (
          <>
            <div className="border-b border-panel-border px-4 py-3">
              <div className="flex justify-between text-xs">
                <span className="text-foreground">{selected.from}</span>
                <span className="text-metal">{selected.date}</span>
              </div>
              <div className="mt-1 text-sm text-foreground">{selected.subject}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground/90">
                {selected.body}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-xs text-metal">
            Aucun message
          </div>
        )}
      </div>
    </div>
  );
}
