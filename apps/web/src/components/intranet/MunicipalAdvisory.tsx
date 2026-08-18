"use client";

import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SystemStatus {
  serverOpen: boolean;
  recruitmentOpen: boolean;
  maintenance: boolean;
}

export function MunicipalAdvisory() {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    apiFetch<SystemStatus>("/system/status").then(setStatus).catch(() => undefined);
  }, []);

  if (!status) return null;

  const items = [
    {
      label: "Accès à la ville",
      value: status.maintenance
        ? "Travaux en cours — accès restreint"
        : status.serverOpen
          ? "Ouvert au public"
          : "Fermé (préparation)",
      ok: !status.maintenance && status.serverOpen,
    },
    {
      label: "Recrutement municipal",
      value: status.recruitmentOpen ? "Candidatures ouvertes" : "Candidatures fermées",
      ok: status.recruitmentOpen,
    },
  ];

  return (
    <section className="hologram-border rounded-lg p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
        <Landmark className="h-5 w-5 text-[#1e3a5f]" />
        Avis municipal
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{item.label}</span>
            <span className={item.ok ? "text-green-400" : "text-yellow-400"}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-xs text-gray-600">
        Communiqué généré depuis l&apos;état officiel du serveur.
      </p>
    </section>
  );
}
