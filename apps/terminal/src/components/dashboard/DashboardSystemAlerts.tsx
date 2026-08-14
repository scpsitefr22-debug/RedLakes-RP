import type { ChapterId, GlobalNarrativeSave } from "@redlakes/narrative-core";
import { getChapterObjective } from "@redlakes/narrative-core";
import { DashboardWidget } from "./DashboardWidget";

type AlertLevel = "critical" | "warning" | "info";

interface SystemAlert {
  id: string;
  level: AlertLevel;
  title: string;
  body: string;
}

const LEVEL_STYLES: Record<AlertLevel, string> = {
  critical: "border-l-red-500 bg-red-950/30 text-red-100",
  warning: "border-l-amber-400 bg-amber-950/20 text-amber-100",
  info: "border-l-dashboard-accent bg-dashboard-accent/10 text-foreground/90",
};

function buildSystemAlerts(gns: GlobalNarrativeSave, chapterId: ChapterId): SystemAlert[] {
  const alerts: SystemAlert[] = [];

  if (gns.world.siteStatus === "breach" || gns.world.siteStatus === "lockdown") {
    alerts.push({
      id: "breach",
      level: "critical",
      title: "ALERTE CONFINEMENT",
      body: "Brèche de confinement signalée — suivre protocole Site-12.",
    });
  }

  if (!gns.flags.ch1_left_director_office) {
    alerts.push({
      id: "director",
      level: "warning",
      title: "CONVOCATION",
      body: "Entretien avec le Directeur du Site requis.",
    });
  } else if (!gns.flags.ch1_chen_resolved) {
    alerts.push({
      id: "chen",
      level: "warning",
      title: "ACTIVITÉ ANORMALE",
      body: "Message non traité — Dr. Mei Chen (secteur Euclid).",
    });
  }

  if (gns.flags.ch1_security_review) {
    alerts.push({
      id: "security",
      level: "warning",
      title: "SÉCURITÉ",
      body: "Convocation obligatoire — protocole de remontée d'anomalie.",
    });
  }

  if (gns.flags.ch1_briefing_attended && !gns.flags.ch1_branch_followup_seen) {
    alerts.push({
      id: "followup",
      level: "info",
      title: "SUIVI BRANCHE",
      body: "Consultez le message de suivi (Chen, Sécurité ou RH) avant la clôture.",
    });
  }

  const objective = getChapterObjective(gns, chapterId);
  if (objective) {
    alerts.push({
      id: "objective",
      level: "info",
      title: "OBJECTIF ACTIF",
      body: objective,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "stable",
      level: "info",
      title: "SYSTÈME STABLE",
      body: "Aucune alerte critique. Site opérationnel.",
    });
  }

  return alerts.slice(0, 4);
}

interface DashboardSystemAlertsProps {
  gns: GlobalNarrativeSave;
  chapterId: ChapterId;
}

export function DashboardSystemAlerts({ gns, chapterId }: DashboardSystemAlertsProps) {
  const alerts = buildSystemAlerts(gns, chapterId);

  return (
    <DashboardWidget title="Alertes système" bodyClassName="overflow-y-auto p-2">
      <ul className="space-y-2">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={`border-l-[3px] px-2 py-1.5 ${LEVEL_STYLES[alert.level]}`}
          >
            <p className="text-[9px] font-bold uppercase tracking-wide">{alert.title}</p>
            <p className="mt-0.5 text-[10px] leading-snug opacity-90">{alert.body}</p>
          </li>
        ))}
      </ul>
    </DashboardWidget>
  );
}
