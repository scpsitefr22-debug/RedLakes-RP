"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Plus, FileLock2 } from "lucide-react";

interface StaffClassifiedDocument {
  id: string;
  slug: string;
  title: string;
  status: string;
  faction: { name: string } | null;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-yellow-400",
  PUBLISHED: "text-green-400",
  ARCHIVED: "text-gray-500",
};

export default function StaffClassifiedDocumentsPage() {
  const [documents, setDocuments] = useState<StaffClassifiedDocument[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<StaffClassifiedDocument[]>("/classified-documents/cms")
      .then(setDocuments)
      .catch(() => setError("Impossible de charger les documents — API indisponible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
            GESTION DES DOCUMENTS CLASSIFIÉS — STAFF
          </p>
          <h1 className="text-4xl font-bold text-white">Documents classifiés</h1>
          <p className="mt-4 text-gray-500">
            Créez, modifiez et supprimez les dossiers restreints par département.
          </p>
        </div>
        <Link
          href="/staff/documents/nouveau"
          className="flex items-center gap-2 rounded border border-redlake bg-redlake/20 px-4 py-2 font-mono text-sm text-white hover:bg-redlake/30"
        >
          <Plus className="h-4 w-4" /> Nouveau document
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && !error && documents.length === 0 && (
        <p className="text-gray-500">Aucun document classifié.</p>
      )}

      <div className="space-y-3">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/staff/documents/${doc.id}`}
            className="flex items-center justify-between hologram-border rounded-lg p-4 transition-colors hover:border-redlake/40"
          >
            <div className="flex items-center gap-3">
              <FileLock2 className="h-5 w-5 text-redlake-glow" />
              <div>
                <h3 className="font-bold text-white">{doc.title}</h3>
                <p className="font-mono text-xs text-gray-600">
                  /{doc.slug}{doc.faction ? ` — ${doc.faction.name}` : ""}
                </p>
              </div>
            </div>
            <span className={`font-mono text-xs uppercase ${STATUS_COLORS[doc.status] ?? "text-gray-500"}`}>
              {doc.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
