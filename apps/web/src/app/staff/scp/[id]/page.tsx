"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ScpEditor, type IncidentItem, type TestItem, type AddendumItem } from "@/components/staff/ScpEditor";
import { ScpRevisionHistory } from "@/components/staff/ScpRevisionHistory";
import { apiFetch } from "@/lib/api";

interface ApiScpFull {
  slug: string;
  number: string;
  name: string;
  class: string;
  threatLevel: number;
  containment: string;
  history: string;
  description: string;
  image: string | null;
  incidents: IncidentItem[];
  tests: TestItem[];
  addendums: AddendumItem[];
  containmentCost: string | null;
  personnelAssigned: number | null;
  breachCount: number | null;
  restrictedDepartmentIds: string[];
}

export default function EditScpPage() {
  const params = useParams();
  const id = params.id as string;
  const [scp, setScp] = useState<ApiScpFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiScpFull>(`/scp/by-id/${id}`)
      .then(setScp)
      .catch(() => setError("Objet introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">{error}</div>;
  }

  if (!scp) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <>
      <ScpEditor
        mode="edit"
        scpId={id}
        initial={{
          slug: scp.slug,
          number: scp.number,
          name: scp.name,
          class: scp.class,
          threatLevel: scp.threatLevel.toString(),
          containment: scp.containment,
          history: scp.history,
          description: scp.description,
          image: scp.image ?? "",
          incidents: scp.incidents,
          tests: scp.tests,
          addendums: scp.addendums,
          containmentCost: scp.containmentCost ?? "",
          personnelAssigned: scp.personnelAssigned?.toString() ?? "",
          breachCount: scp.breachCount?.toString() ?? "",
          restrictedDepartmentIds: scp.restrictedDepartmentIds,
        }}
      />
      <div className="mx-auto max-w-3xl px-4 pb-12">
        <ScpRevisionHistory scpId={id} />
      </div>
    </>
  );
}
