"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getFactionTheme as getVisualTheme, type FactionTheme } from "@/lib/faction-themes";
import { getFactionTheme as getVocabTheme, type FactionTheme as FactionVocab } from "@/lib/faction-theme";

interface CoreCharacter {
  grade: string;
  faction: string;
  teamName: string | null;
  playtime: number;
  reputation: number;
  sanctions: number;
  medals: string[];
  factionInfo: { slug: string; name: string } | null;
  gradeInfo: {
    branch: string;
    tier: string;
    departmentRef: { id: string; slug: string; name: string } | null;
  } | null;
  teamInfo: { slug: string; name: string } | null;
}

export interface CoreSession {
  loading: boolean;
  authenticated: boolean;
  username: string | null;
  displayName: string | null;
  role: string | null;
  staffRank: string | null;
  character: CoreCharacter | null;
  /** "civil" quand le personnage actif n'a pas de faction réelle assignée (défaut du modèle Player) */
  factionSlug: string;
  /** Identité visuelle (couleurs/police/motif) — lib/faction-themes.ts, système des fiches publiques */
  theme: FactionTheme;
  /** Vocabulaire fonctionnel (nom de réseau, libellés de rapports) — lib/faction-theme.ts, système déjà utilisé par l'Intranet */
  vocab: FactionVocab;
}

const GUEST_STATE: CoreSession = {
  loading: true,
  authenticated: false,
  username: null,
  displayName: null,
  role: null,
  staffRank: null,
  character: null,
  factionSlug: "civil",
  theme: getVisualTheme("civil"),
  vocab: getVocabTheme("civil"),
};

interface AuthMeResponse {
  authenticated: boolean;
  user?: {
    username: string;
    displayName: string;
    role: string;
    staffRank: string | null;
    activeCharacter: CoreCharacter | null;
  };
}

export function useCoreSession(): CoreSession {
  const [state, setState] = useState<CoreSession>(GUEST_STATE);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<AuthMeResponse>("/auth/me");
        if (!res.authenticated || !res.user) {
          setState({ ...GUEST_STATE, loading: false });
          return;
        }

        const character = res.user.activeCharacter;
        const factionSlug = character?.factionInfo?.slug ?? "civil";

        setState({
          loading: false,
          authenticated: true,
          username: res.user.username,
          displayName: res.user.displayName,
          role: res.user.role,
          staffRank: res.user.staffRank,
          character,
          factionSlug,
          theme: getVisualTheme(factionSlug),
          vocab: getVocabTheme(factionSlug),
        });
      } catch {
        setState({ ...GUEST_STATE, loading: false });
      }
    })();
  }, []);

  return state;
}
