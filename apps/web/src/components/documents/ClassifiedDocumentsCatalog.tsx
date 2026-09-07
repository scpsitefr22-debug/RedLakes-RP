"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileLock2 } from "lucide-react";
import {
  getClassifiedDocuments,
  type ClassifiedDocumentSummary,
} from "@/lib/classified-documents-api";

export function ClassifiedDocumentsCatalog() {
  const [documents, setDocuments] = useState<ClassifiedDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setDocuments(await getClassifiedDocuments());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Chargement des archives…</p>;
  }

  if (documents.length === 0) {
    return (
      <p className="text-gray-500">
        Aucun document accessible à votre habilitation pour le moment.
      </p>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {documents.map((doc) => (
        <Link
          key={doc.id}
          href={`/documents/${doc.slug}`}
          className="group flex gap-4 rounded border border-metal/50 p-4 transition-colors hover:border-redlake/30 hover:bg-redlake/5"
        >
          <FileLock2 className="h-5 w-5 shrink-0 text-redlake-glow" />
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-white group-hover:text-redlake-glow">
                {doc.title}
              </h3>
              {doc.faction && (
                <span
                  className="rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase"
                  style={{ borderColor: doc.faction.color ?? undefined, color: doc.faction.color ?? undefined }}
                >
                  {doc.faction.name}
                </span>
              )}
            </div>
            {doc.excerpt && (
              <p className="line-clamp-2 text-sm text-gray-500">{doc.excerpt}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
