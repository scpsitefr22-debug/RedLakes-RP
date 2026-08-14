import { Calendar, Clock } from "lucide-react";
import { getPlayerDisplayName } from "@redlakes/narrative-core";
import type { GlobalNarrativeSave } from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  status: "à venir" | "terminé" | "obligatoire";
  visible: boolean;
}

function getEvents(gns: GlobalNarrativeSave): CalendarEvent[] {
  const name = getPlayerDisplayName(gns);
  const events: CalendarEvent[] = [
    {
      id: "integration",
      time: "07:30",
      title: "Accueil terminal — intégration",
      location: "Poste de travail assigné",
      status: "terminé",
      visible: true,
    },
    {
      id: "director",
      time: "—",
      title: "Entretien Directeur du Site",
      location: "Aile administrative — Bureau Directeur",
      status: "obligatoire",
      visible: !gns.flags.ch1_left_director_office,
    },
    {
      id: "briefing",
      time: "08:00",
      title: `Briefing sécurité — ${name}`,
      location: "Salle de conférence B",
      status: gns.flags.ch1_briefing_attended ? "terminé" : "obligatoire",
      visible: Boolean(gns.flags.ch1_directeur_resolved || gns.flags.ch1_briefing_reminder_sent),
    },
    {
      id: "security-review",
      time: "14:00",
      title: "Entretien Département Sécurité",
      location: "Bureau Sécurité — Aile est",
      status: "à venir",
      visible: Boolean(gns.flags.ch1_security_review),
    },
  ];
  return events.filter((e) => e.visible);
}

export function CalendarApp() {
  const { gns } = useGNSRequired();
  const events = getEvents(gns);
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-panel-border px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-foreground">
          <Calendar className="h-4 w-4 text-redlake" />
          Agenda personnel — Site-12
        </div>
        <p className="mt-1 text-[10px] capitalize text-metal">{today}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Clock className="h-8 w-8 text-metal/40" />
            <p className="text-xs text-metal">Aucun événement planifié pour le moment.</p>
            <p className="text-[10px] text-metal/60">
              Les convocations apparaissent après vos briefings initiaux.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className={`border border-panel-border p-3 ${
                  event.status === "obligatoire" ? "border-redlake/30 bg-redlake/5" : "bg-classified"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-foreground">{event.title}</div>
                    <div className="mt-1 text-[10px] text-metal">{event.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">{event.time}</div>
                    <div
                      className={`mt-0.5 text-[9px] uppercase ${
                        event.status === "terminé"
                          ? "text-terminal"
                          : event.status === "obligatoire"
                            ? "text-redlake"
                            : "text-amber-500"
                      }`}
                    >
                      {event.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
