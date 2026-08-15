"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DepartmentEditor } from "@/components/staff/DepartmentEditor";
import { apiFetch } from "@/lib/api";

interface ApiDepartmentFull {
  slug: string;
  name: string;
  factionId: string | null;
  omegaTier: string | null;
  directorGradeName: string | null;
  color: string | null;
  utilities: string[];
  objectives: string[];
  chefId: string | null;
  deputyIds: string[];
  budget: number;
}

export default function EditDepartementPage() {
  const params = useParams();
  const id = params.id as string;
  const [department, setDepartment] = useState<ApiDepartmentFull | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ApiDepartmentFull>(`/departments/by-id/${id}`)
      .then(setDepartment)
      .catch(() => setError("Département introuvable ou API indisponible — connectez-vous en staff."));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!department) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <DepartmentEditor
      mode="edit"
      departmentId={id}
      initial={{
        slug: department.slug,
        name: department.name,
        factionId: department.factionId ?? "",
        omegaTier: department.omegaTier ?? "",
        directorGradeName: department.directorGradeName ?? "",
        color: department.color ?? "",
        utilities: department.utilities.join(", "),
        objectives: department.objectives.join(", "),
        chefId: department.chefId ?? "",
        deputyIds: department.deputyIds.join(", "),
        budget: department.budget.toString(),
      }}
    />
  );
}
