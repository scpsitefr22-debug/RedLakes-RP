import { useMemo, useState } from "react";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
  getAllTerminalDocuments,
  getDocumentAccessState,
  recordDocumentRead,
} from "@redlakes/narrative-core";
import { Lock, FileText } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

interface DocumentsAppProps {
  onOpenDocument: (documentId: string) => void;
}

export function DocumentsApp({ onOpenDocument }: DocumentsAppProps) {
  const { gns, updateGNS } = useGNSRequired();
  const [category, setCategory] = useState<DocumentCategory>("rapport");
  const allDocs = useMemo(() => getAllTerminalDocuments(), []);

  const categoryDocs = useMemo(
    () => allDocs.filter((doc) => doc.category === category),
    [allDocs, category]
  );

  const counts = useMemo(() => {
    const map: Partial<Record<DocumentCategory, { total: number; available: number }>> = {};
    for (const cat of DOCUMENT_CATEGORIES) {
      const docs = allDocs.filter((d) => d.category === cat);
      map[cat] = {
        total: docs.length,
        available: docs.filter((d) => getDocumentAccessState(gns, d).access === "available").length,
      };
    }
    return map;
  }, [allDocs, gns]);

  const handleOpen = (docId: string) => {
    const doc = allDocs.find((d) => d.id === docId);
    if (!doc) return;
    const state = getDocumentAccessState(gns, doc);
    if (state.access === "available") {
      updateGNS((g) => recordDocumentRead(g, docId));
    }
    onOpenDocument(docId);
  };

  return (
    <div className="flex h-full">
      <nav className="flex w-44 flex-col border-r border-panel-border bg-classified">
        <div className="border-b border-panel-border px-3 py-2 text-[10px] uppercase tracking-wider text-metal">
          Explorateur
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {DOCUMENT_CATEGORIES.map((cat) => {
            const stat = counts[cat];
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-[11px] transition-colors ${
                  active ? "bg-redlake/10 text-foreground" : "text-metal hover:bg-panel"
                }`}
              >
                <span>{DOCUMENT_CATEGORY_LABELS[cat]}</span>
                {stat && (
                  <span className="text-[9px] text-metal/70">
                    {stat.available}/{stat.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-panel-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
          {DOCUMENT_CATEGORY_LABELS[category]} — Site-12
        </div>
        <div className="flex-1 overflow-y-auto">
          {categoryDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <FileText className="h-8 w-8 text-metal/40" />
              <p className="text-xs text-metal">Aucun document dans cette catégorie.</p>
            </div>
          ) : (
            categoryDocs.map((doc) => {
              const access = getDocumentAccessState(gns, doc);
              const locked = access.access !== "available";
              const read = gns.world.documentsRead.includes(doc.id);

              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleOpen(doc.id)}
                  className="flex w-full items-center gap-3 border-b border-panel-border/40 px-4 py-3 text-left transition-colors hover:bg-classified"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                      locked ? "bg-metal/20 text-metal" : "bg-redlake/10 text-redlake"
                    }`}
                  >
                    {locked ? <Lock className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-xs ${read ? "text-metal" : "text-foreground"}`}>
                      {doc.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[9px] text-metal">
                      <span>Clearance {doc.clearance}</span>
                      {access.access === "progress_locked" && (
                        <span className="text-amber-600/80">Verrouillé</span>
                      )}
                      {access.access === "clearance_denied" && (
                        <span className="text-redlake/80">Accès refusé</span>
                      )}
                      {access.access === "available" && read && (
                        <span className="text-terminal/70">Consulté</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
