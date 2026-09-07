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

      <div className="mb-4 flex flex-wrap gap-2">
        {doc.faction && (
          <span
            className="rounded border px-2 py-1 font-mono text-[10px] uppercase"
            style={{ borderColor: doc.faction.color ?? undefined, color: doc.faction.color ?? undefined }}
          >
            {doc.faction.name}
          </span>
        )}
        {doc.tags.map((tag) => (
          <span
            key={tag}
            className="rounded border border-metal px-2 py-1 font-mono text-[10px] text-gray-500"
          >
            {tag}
          </span>
        ))}
      </div>

      <EditableText
        as="h1"
        className="mb-3 text-4xl font-bold text-white"
        value={doc.title}
        endpoint={`/classified-documents/${doc.id}`}
        field="title"
      />
      <EditableText
        as="p"
        className="mb-8 text-lg text-gray-500"
        value={doc.excerpt}
        endpoint={`/classified-documents/${doc.id}`}
        field="excerpt"
        placeholder="Cliquer pour ajouter un extrait…"
      />

      <EditableText
        value={doc.content}
        endpoint={`/classified-documents/${doc.id}`}
        field="content"
        multiline
        paragraphs
        wrapperClassName="prose-redlake hologram-border space-y-6 rounded-lg p-8"
        className="text-gray-300 leading-relaxed"
      />

      {doc.attachments.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-gray-500">
            <Paperclip className="h-3.5 w-3.5" /> Pièces jointes
          </p>
          {doc.attachments.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate font-mono text-xs text-redlake-glow hover:underline"
            >
              {url}
            </a>
          ))}
        </div>
      )}

      {(doc.linkedEvents.length > 0 || doc.linkedScpObjects.length > 0) && (
        <div className="mt-6 space-y-4">
          <p className="font-mono text-xs uppercase tracking-wide text-gray-500">Entités associées</p>
          {doc.linkedEvents.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-gray-600">
                <FileText className="h-3 w-3" /> Événements
              </p>
              <div className="flex flex-wrap gap-2">
                {doc.linkedEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={`/evenements/${e.slug}`}
                    className="rounded border border-metal/50 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-redlake/40 hover:text-white"
                  >
                    {e.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {doc.linkedScpObjects.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-gray-600">
                <FlaskConical className="h-3 w-3" /> Objets SCP
              </p>
              <div className="flex flex-wrap gap-2">
                {doc.linkedScpObjects.map((s) => (
                  <Link
                    key={s.id}
                    href={`/wiki/${s.slug}`}
                    className="rounded border border-metal/50 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-redlake/40 hover:text-white"
                  >
                    <span className="font-mono text-redlake-glow">{s.number}</span> — {s.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {doc.author?.minecraftUsername && (
        <p className="mt-6 font-mono text-[10px] text-gray-600">
          Rédigé par {doc.author.minecraftUsername}
        </p>
      )}
    </>
  );
}
