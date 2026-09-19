"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IncidentReportEditor } from "@/components/staff/IncidentReportEditor";
import { apiFetch } from "@/lib/api";

interface ApiPersonnelRow {
  unite: string;
  grade: string;
  statut: string;
  obs: string;
}

interface ApiEquipmentRow {
  designation: string;
  quantite: string;
  etat: string;
  cout: number;
}

interface ApiIncidentReportFull {
  slug: string;
  reference: string;
  incidentAt: string;
  anomalyLabel: string;
  threatClass: string;
  factsTag: string | null;
  narrative: string;
  personnelRows: ApiPersonnelRow[];
  equipmentRows: ApiEquipmentRow[];
  authorLabel: string;
  authorRole: string | null;
  validatorLabel: string | null;
  validatorRole: string | null;
  restrictedDepartmentIds: string[];
  minClearanceLevel: number;
  departmentId: string | null;
}

export default function EditIncidentReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<ApiIncidentReportFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiIncidentReportFull>(`/incident-reports/by-id/${id}`)
      .then(setReport)
      .catch(() => setError("Rapport introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">{error}</div>;
  }

  if (!report) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <IncidentReportEditor
      mode="edit"
      reportId={id}
      initial={{
        slug: report.slug,
        reference: report.reference,
        incidentAt: report.incidentAt,
        anomalyLabel: report.anomalyLabel,
        threatClass: report.threatClass,
        factsTag: report.factsTag ?? "",
        narrative: report.narrative,
        personnelRows: report.personnelRows,
        equipmentRows: report.equipmentRows.map((r) => ({ ...r, cout: String(r.cout) })),
        authorLabel: report.authorLabel,
        authorRole: report.authorRole ?? "",
        validatorLabel: report.validatorLabel ?? "",
        validatorRole: report.validatorRole ?? "",
        restrictedDepartmentIds: report.restrictedDepartmentIds,
        minClearanceLevel: String(report.minClearanceLevel),
        departmentId: report.departmentId ?? "",
      }}
    />
  );
}
