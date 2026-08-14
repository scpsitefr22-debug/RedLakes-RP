"use client";

import { useEffect, useState } from "react";
import { FactionGradesPanel } from "@/components/factions/FactionGradesPanel";
import { apiFetch } from "@/lib/api";

export function FactionGradesSection() {
  const [grade, setGrade] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ authenticated: boolean }>("/auth/me");
        if (!me.authenticated) return;
        const player = await apiFetch<{ grade: string }>("/players/me");
        setGrade(player.grade);
      } catch {
        /* visiteur anonyme */
      }
    })();
  }, []);

  return <FactionGradesPanel playerGrade={grade} />;
}
