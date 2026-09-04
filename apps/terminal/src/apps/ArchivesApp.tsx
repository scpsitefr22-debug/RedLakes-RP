import { useMemo, useState } from "react";
import { Lock, Archive as ArchiveIcon } from "lucide-react";
import { getPlayerClearance } from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";

type ArchiveCategory = "incident" | "personnel" | "fondation";

interface ArchiveRecord {
  id: string;
  title: string;
  category: ArchiveCategory;
  clearance: number;
  date: string;
  summary: string;
  unlockFlag?: string;
}

const CATEGORY_LABELS: Record<ArchiveCategory, string> = {
  incident: "Incidents archivés",
  personnel: "Dossiers personnel",
  fondation: "Fondation — historique",
};

const ARCHIVE_RECORDS: ArchiveRecord[] = [
  {
    id: "arc-keter02",
    title: "SYNTHESE_BRECHE_K02_archive.pdf",
    category: "incident",
    clearance: 1,
    date: "15 juin 2026",
    summary: "Version archivée de la synthèse Keter-02 — copie de conservation, accès public clearance 1.",
    unlockFlag: "cassie_queried_incidents",
  },
  {
    id: "arc-mur-de-fer",
    title: "OPERATION_MUR_DE_FER.pdf",
    category: "incident",
    clearance: 1,
    date: "1 juin 2026",
    summary: "Rapport d'opération FIM Nu-7 — zone industrielle sécurisée. Classé sans suite.",
  },
  {
    id: "arc-personnel-c2",
    title: "REGISTRE_ARCHIVISTES.pdf",
    category: "personnel",
    clearance: 2,
    date: "Permanent",
    summary: "Liste des titulaires clearance Archives depuis la fondation du Site-12.",
  },
  {
    id: "arc-euclid-fondation",
    title: "SECTEUR_EUCLID_historique.pdf",
    category: "fondation",
    clearance: 2,
    date: "Mise à jour continue",
    summary: "Historique des révisions protocolaires du secteur Euclid-7 depuis sa mise en service.",
    unlockFlag: "ch1_chen_logs_received",
  },
  {
    id: "arc-site12-founding",
    title: "CHARTE_FONDATION_SITE-12.pdf",
    category: "fondation",
    clearance: 1,
    date: "Archive permanente",
    summary: "Charte fondatrice du Site-12 — mission, chaîne de commandement, rattachement au Conseil Oméga.",
  },
];

export function ArchivesApp() {
  const { gns } = useGNSRequired();
  const [category, setCategory] = useState<ArchiveCategory>("incident");
  const clearance = getPlayerClearance(gns);

  const records = useMemo(
    () => ARCHIVE_RECORDS.filter((r) => r.category === category),
    [category]
  );

  const isUnlocked = (record: ArchiveRecord) =>
    !record.unlockFlag || Boolean(gns.flags[record.unlockFlag]);

  return (
    <div className="flex h-full">
      <nav className="flex w-48 flex-col border-r border-dashboard-border bg-[#0a1018]">
        <div className="border-b border-dashboard-border px-3 py-2 text-[10px] uppercase tracking-wider text-metal">
          Archives — Site-12
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {(Object.keys(CATEGORY_LABELS) as ArchiveCategory[]).map((cat) => {
            const active = category === cat;
            const count = ARCHIVE_RECORDS.filter((r) => r.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-[11px] transition-colors ${
                  active ? "bg-dashboard-accent/15 text-foreground" : "text-metal hover:bg-dashboard-panel"
                }`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="text-[9px] text-metal/70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-dashboard-border px-3 py-2 text-[9px] leading-relaxed text-metal/70">
          Toute consultation est journalisée.
          <br />— Archives, clearance 2
        </div>
      </nav>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-dashboard-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
          {CATEGORY_LABELS[category]}
        </div>
        <div className="flex-1 overflow-y-auto">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <ArchiveIcon className="h-8 w-8 text-metal/40" />
              <p className="text-xs text-metal">Aucun enregistrement dans cette catégorie.</p>
            </div>
          ) : (
            records.map((record) => {
              const unlocked = isUnlocked(record);
              const denied = record.clearance > clearance;
              const accessible = unlocked && !denied;

              return (
                <div
                  key={record.id}
                  className="flex items-start gap-3 border-b border-dashboard-border/60 px-4 py-3"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                      accessible ? "bg-dashboard-accent/10 text-dashboard-accent" : "bg-metal/15 text-metal"
                    }`}
                  >
                    {accessible ? <ArchiveIcon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`truncate text-xs ${accessible ? "text-foreground" : "text-metal"}`}>
                        {record.title}
                      </span>
                      <span className="text-[9px] text-metal/70">{record.date}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-metal">
                      {accessible ? record.summary : "Contenu verrouillé."}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[9px]">
                      <span
                        className={
                          record.clearance <= clearance ? "text-terminal/80" : "text-redlake/80"
                        }
                      >
                        Clearance {record.clearance}
                      </span>
                      {!unlocked && (
                        <span className="text-amber-500/80">Non débloqué par votre progression</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
