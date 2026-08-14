import { X, ShieldAlert } from "lucide-react";

import {

  TERMINAL_DOCUMENTS,

  DOCUMENT_CATEGORY_LABELS,

  getDocumentAccessState,

  getDocumentContent,

  getPlayerClearance,

  type TerminalDocument,

} from "@redlakes/narrative-core";

import { useGNSRequired } from "../context/GNSContext";



interface DocumentViewerProps {

  documentId: string;

  onClose: () => void;

}



export function DocumentViewer({ documentId, onClose }: DocumentViewerProps) {

  const { gns } = useGNSRequired();

  const doc: TerminalDocument | undefined = TERMINAL_DOCUMENTS[documentId];

  const playerClearance = getPlayerClearance(gns);



  if (!doc) {

    return (

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-6">

        <div className="max-w-lg border border-panel-border bg-panel p-6">

          <p className="text-xs text-redlake">Document introuvable : {documentId}</p>

          <button

            type="button"

            onClick={onClose}

            className="mt-4 border border-panel-border px-3 py-1.5 text-xs text-foreground hover:bg-classified"

          >

            Fermer

          </button>

        </div>

      </div>

    );

  }



  const access = getDocumentAccessState(gns, doc);



  if (access.access === "progress_locked") {

    return (

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-6">

        <div className="max-w-md border border-panel-border bg-panel p-6 text-center shadow-lg">

          <ShieldAlert className="mx-auto h-8 w-8 text-metal" />

          <p className="mt-3 text-sm text-foreground">Document non disponible</p>

          <p className="mt-2 text-xs text-metal">

            Ce fichier n'a pas encore été débloqué dans votre dossier Site-12.

          </p>

          <button

            type="button"

            onClick={onClose}

            className="mt-4 border border-panel-border px-4 py-2 text-xs text-foreground hover:bg-classified"

          >

            Fermer

          </button>

        </div>

      </div>

    );

  }



  if (access.access === "clearance_denied") {

    return (

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-6">

        <div className="max-w-md border border-redlake/50 bg-panel p-6 text-center shadow-lg">

          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-redlake bg-redlake/10">

            <ShieldAlert className="h-6 w-6 text-redlake" />

          </div>

          <p className="mt-4 text-sm font-medium tracking-wide text-redlake">

            ACCÈS REFUSÉ — Clearance {access.requiredClearance} requise

          </p>

          <p className="mt-2 text-[10px] text-metal">

            Votre clearance actuelle : niveau {playerClearance}. Demande d'accès enregistrée.

          </p>

          <p className="mt-1 text-[10px] text-metal/70">{doc.title}</p>

          <button

            type="button"

            onClick={onClose}

            className="mt-4 border border-panel-border px-4 py-2 text-xs text-foreground hover:bg-classified"

          >

            Fermer

          </button>

        </div>

      </div>

    );

  }



  const content = getDocumentContent(doc, gns);



  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-6">

      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col border border-panel-border bg-panel shadow-2xl">

        <header className="flex items-start justify-between gap-4 border-b border-panel-border bg-classified px-4 py-3">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="border border-panel-border bg-panel px-2 py-0.5 text-[9px] uppercase tracking-wider text-metal">

                {DOCUMENT_CATEGORY_LABELS[doc.category]}

              </span>

              <span

                className={`px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider ${

                  doc.clearance <= playerClearance

                    ? "bg-terminal/10 text-terminal"

                    : "bg-redlake/10 text-redlake"

                }`}

              >

                Clearance {doc.clearance}

              </span>

              <span className="text-[9px] text-metal">INTERNE — Site-12</span>

            </div>

            <h2 className="mt-2 truncate text-sm text-foreground">{doc.title}</h2>

          </div>

          <button

            type="button"

            onClick={onClose}

            className="shrink-0 p-1 text-metal hover:text-foreground"

            aria-label="Fermer"

          >

            <X className="h-4 w-4" />

          </button>

        </header>

        <div className="flex-1 overflow-y-auto p-4">

          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">

            {content}

          </pre>

        </div>

        <footer className="flex items-center justify-between border-t border-panel-border px-4 py-2 text-[9px] text-metal">

          <span>Document consulté — archivage local Site-12</span>

          <span>ID : {doc.id}</span>

        </footer>

      </div>

    </div>

  );

}


