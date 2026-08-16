"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GradeEditor } from "@/components/staff/GradeEditor";
import { apiFetch } from "@/lib/api";
import type { ApiGrade } from "@/lib/grade-labels";

export default function EditGradePage() {
  const params = useParams();
  const id = params.id as string;
  const [grade, setGrade] = useState<ApiGrade | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiGrade>(`/grades/by-id/${id}`)
      .then(setGrade)
      .catch(() => setError("Grade introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!grade) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <GradeEditor
      mode="edit"
      gradeId={id}
      initial={{
        slug: grade.slug,
        name: grade.name,
        branch: grade.branch,
        tier: grade.tier,
        departmentId: grade.departmentId ?? "",
        departmentRefId: grade.departmentRef?.id ?? "",
        pay: grade.pay?.toString() ?? "",
        quota: grade.quota?.toString() ?? "",
        description: grade.description ?? "",
        objectives: grade.objectives.join(", "),
        utilities: grade.utilities.join(", "),
        accessZones: grade.accessZones.join(", "),
        siteSections: grade.siteSections.join(", "),
      }}
    />
  );
}
