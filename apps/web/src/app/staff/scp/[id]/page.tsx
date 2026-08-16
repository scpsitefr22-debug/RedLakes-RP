"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ScpEditor } from "@/components/staff/ScpEditor";
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
  incidents: unknown;
  tests: unknown;
  addendums: unknown;
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
        incidents: JSON.stringify(scp.incidents, null, 2),
        tests: JSON.stringify(scp.tests, null, 2),
        addendums: JSON.stringify(scp.addendums, null, 2),
        containmentCost: scp.containmentCost ?? "",
        personnelAssigned: scp.personnelAssigned?.toString() ?? "",
        breachCount: scp.breachCount?.toString() ?? "",
        restrictedDepartmentIds: scp.restrictedDepartmentIds,
      }}
    />
  );
}
