"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, ArrowLeft, Paperclip, FileText, FlaskConical } from "lucide-react";
import {
  getClassifiedDocument,
  type ClassifiedDocumentFull,
} from "@/lib/classified-documents-api";
import { EditableText } from "@/components/staff/EditableText";

export function ClassifiedDocumentReader({ slug }: { slug: string }) {
  const [doc, setDoc] = useState<ClassifiedDocumentFull | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      setDoc(await getClassifiedDocument(slug));
    })();
  }, [slug]);

  if (doc === undefined) {
    return <p className="text-gray-500">Chargement du dossier…</p>;
  }

  if (!doc) {
    return (
      <div className="hologram-border rounded-lg p-8 text-center">
        <Lock className="mx-auto mb-4 h-8 w-8 text-red-400" />
        <h2 className="text-xl font-bold text-white">Accès refusé ou dossier introuvable</h2>
        <p className="mt-2 text-gray-500">
          Ce document est réservé à un autre département, ou n&apos;existe pas.{" "}
          <Link href="/connexion" className="text-redlake-glow hover:underline">
            Connectez-vous
          </Link>{" "}
          si vous pensez y avoir accès.
        </p>
        <Link
          href="/documents"
          className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Retour aux documents
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/documents"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Documents classifiés
      </Link>

      {/* Même gabarit "document papier" que les rapports d'incident — voir IncidentReportReader.tsx. */}
      <div className="overflow-hidden rounded-lg border border-black/10 bg-white text-slate-900 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6" style={{ background: "#0a1120" }}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Fondation SCP — Document classifié
            </p>
            <EditableText
              as="h1"
              className="mt-1 text-2xl font-bold text-white sm:text-3xl"
              value={doc.title}
              endpoint={`/classified-documents/${doc.id}`}
              field="title"
            />
          </div>
          {doc.faction && (
            <div className="rounded px-4 py-2 text-right" style={{ background: doc.faction.color ?? "#475569" }}>
              <p className="text-sm font-bold uppercase text-white">{doc.faction.name}</p>
            </div>
          )}
        </div>

        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-4">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-300 px-2 py-0.5 font-mono text-[10px] uppercase text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="border-b border-slate-200 p-6">
          <EditableText
            as="p"
            className="text-lg italic text-slate-600"
            value={doc.excerpt}
            endpoint={`/classified-documents/${doc.id}`}
            field="excerpt"
            placeholder="Cliquer pour ajouter un extrait…"
          />
        </div>

        <div className="p-6">
          <EditableText
            value={doc.content}
            endpoint={`/classified-documents/${doc.id}`}
            field="content"
            multiline
            paragraphs
            wrapperClassName="space-y-6"
            className="text-slate-700 leading-relaxed"
          />
        </div>

        {doc.attachments.length > 0 && (
          <div className="border-t border-slate-200 p-6">
            <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-slate-500">
              <Paperclip className="h-3.5 w-3.5" /> Pièces jointes
            </p>
            <div className="space-y-1">
              {doc.attachments.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate font-mono text-xs text-blue-700 hover:underline"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        )}

        {(doc.linkedEvents.length > 0 || doc.linkedScpObjects.length > 0) && (
          <div className="space-y-4 border-t border-slate-200 p-6">
            <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Entités associées</p>
            {doc.linkedEvents.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-slate-500">
                  <FileText className="h-3 w-3" /> Événements
                </p>
                <div className="flex flex-wrap gap-2">
                  {doc.linkedEvents.map((e) => (
                    <Link
                      key={e.id}
                      href={`/evenements/${e.slug}`}
                      className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-50"
                    >
                      {e.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {doc.linkedScpObjects.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-slate-500">
                  <FlaskConical className="h-3 w-3" /> Objets SCP
                </p>
                <div className="flex flex-wrap gap-2">
                  {doc.linkedScpObjects.map((s) => (
                    <Link
                      key={s.id}
                      href={`/wiki/${s.slug}`}
                      className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-50"
                    >
                      <span className="font-mono text-slate-900">{s.number}</span> — {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {doc.author?.minecraftUsername && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
              Rédigé par {doc.author.minecraftUsername}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
              Fondation SCP — Document officiel
            </p>
          </div>
        )}
      </div>
    </>
  );
}
