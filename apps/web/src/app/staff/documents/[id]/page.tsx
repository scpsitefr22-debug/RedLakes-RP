"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClassifiedDocumentEditor } from "@/components/staff/ClassifiedDocumentEditor";
import { ClassifiedDocumentRevisionHistory } from "@/components/staff/ClassifiedDocumentRevisionHistory";
import { apiFetch } from "@/lib/api";

interface ApiClassifiedDocumentFull {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
  restrictedDepartmentIds: string[];
  factionId: string | null;
  tags: string[];
  attachments: string[];
  linkedEvents: { id: string }[];
  linkedScpObjects: { id: string }[];
}

export default function EditClassifiedDocumentPage() {
  const params = useParams();
  const id = params.id as string;
  const [doc, setDoc] = useState<ApiClassifiedDocumentFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiClassifiedDocumentFull>(`/classified-documents/by-id/${id}`)
      .then(setDoc)
      .catch(() => setError("Document introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">{error}</div>;
  }

  if (!doc) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <>
      <ClassifiedDocumentEditor
        mode="edit"
        documentId={id}
        initial={{
          slug: doc.slug,
          title: doc.title,
          excerpt: doc.excerpt ?? "",
          content: doc.content,
          status: doc.status,
          restrictedDepartmentIds: doc.restrictedDepartmentIds,
          factionId: doc.factionId ?? "",
          tags: doc.tags.join(", "),
          attachments: doc.attachments.join(", "),
          linkedEventIds: doc.linkedEvents.map((e) => e.id),
          linkedScpIds: doc.linkedScpObjects.map((s) => s.id),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 pb-12">
        <ClassifiedDocumentRevisionHistory documentId={id} />
      </div>
    </>
  );
}
