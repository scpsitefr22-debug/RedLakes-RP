"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface PlayerSession {
  loading: boolean;
  authenticated: boolean;
  departmentId: string | null;
  departmentName: string | null;
  username: string | null;
  displayName: string | null;
  role: string | null;
  discordLinked: boolean;
}

const GUEST_STATE: PlayerSession = {
  loading: true,
  authenticated: false,
  departmentId: null,
  departmentName: null,
  username: null,
  displayName: null,
  role: null,
  discordLinked: false,
};

export function usePlayerSession(): PlayerSession {
  const [state, setState] = useState<PlayerSession>(GUEST_STATE);

  useEffect(() => {
    (async () => {
      try {
        const auth = await apiFetch<{
          authenticated: boolean;
          user?: {
            username: string;
            displayName: string;
            role: string;
            discordLinked: boolean;
          };
        }>("/auth/me");

        if (!auth.authenticated || !auth.user) {
          setState({ ...GUEST_STATE, loading: false });
          return;
        }

        let departmentId: string | null = null;
        let departmentName: string | null = null;
        try {
          const profile = await apiFetch<{
            gradeInfo?: {
              departmentRefId: string | null;
              departmentRef?: { name: string } | null;
            } | null;
          }>("/players/me");
          departmentId = profile.gradeInfo?.departmentRefId ?? null;
          departmentName = profile.gradeInfo?.departmentRef?.name ?? null;
        } catch {
          /* pas de fiche joueur — accès public uniquement */
        }

        setState({
          loading: false,
          authenticated: true,
          departmentId,
          departmentName,
          username: auth.user.username,
          displayName: auth.user.displayName,
          role: auth.user.role,
          discordLinked: auth.user.discordLinked,
        });
      } catch {
        setState({ ...GUEST_STATE, loading: false });
      }
    })();
  }, []);

  return state;
}
