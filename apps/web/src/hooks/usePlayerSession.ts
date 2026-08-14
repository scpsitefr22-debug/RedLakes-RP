"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ClearanceLevel } from "@/lib/clearance";

export interface PlayerSession {
  loading: boolean;
  authenticated: boolean;
  clearance: ClearanceLevel;
  username: string | null;
  displayName: string | null;
  role: string | null;
  discordLinked: boolean;
}

const GUEST_CLEARANCE = 1 as ClearanceLevel;

export function usePlayerSession(): PlayerSession {
  const [state, setState] = useState<PlayerSession>({
    loading: true,
    authenticated: false,
    clearance: GUEST_CLEARANCE,
    username: null,
    displayName: null,
    role: null,
    discordLinked: false,
  });

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
            player?: { clearance: number };
          };
        }>("/auth/me");

        if (!auth.authenticated || !auth.user) {
          setState({
            loading: false,
            authenticated: false,
            clearance: GUEST_CLEARANCE,
            username: null,
            displayName: null,
            role: null,
            discordLinked: false,
          });
          return;
        }

        let clearance = auth.user.player?.clearance;
        if (clearance === undefined) {
          const profile = await apiFetch<{ clearance: number }>("/players/me");
          clearance = profile.clearance;
        }

        const level = Math.min(
          Math.max(Math.round(clearance ?? 1), 1),
          5,
        ) as ClearanceLevel;

        setState({
          loading: false,
          authenticated: true,
          clearance: level,
          username: auth.user.username,
          displayName: auth.user.displayName,
          role: auth.user.role,
          discordLinked: auth.user.discordLinked,
        });
      } catch {
        setState({
          loading: false,
          authenticated: false,
          clearance: GUEST_CLEARANCE,
          username: null,
          displayName: null,
          role: null,
          discordLinked: false,
        });
      }
    })();
  }, []);

  return state;
}

export function canViewClearance(
  required: number,
  userClearance: ClearanceLevel,
): boolean {
  return userClearance >= required;
}
