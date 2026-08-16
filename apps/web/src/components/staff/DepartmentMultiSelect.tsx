"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface DepartmentOption {
  id: string;
  name: string;
}

interface DepartmentMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function DepartmentMultiSelect({ value, onChange }: DepartmentMultiSelectProps) {
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  useEffect(() => {
    apiFetch<DepartmentOption[]>("/departments")
      .then(setDepartments)
      .catch(() => undefined);
  }, []);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((d) => d !== id) : [...value, id]);
  };

  return (
    <div>
      <label className="mb-1 block font-mono text-xs text-gray-500">
        Départements autorisés (aucun = public)
      </label>
      {departments.length === 0 ? (
        <p className="text-xs text-gray-600">Aucun département disponible.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => {
            const active = value.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggle(d.id)}
                className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
                  active
                    ? "border-redlake bg-redlake/20 text-white"
                    : "border-metal text-gray-500 hover:border-redlake/40"
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-1 text-[10px] text-gray-600">
        Visible uniquement par le personnel des départements cochés. Aucune sélection = visible par tous.
      </p>
    </div>
  );
}
