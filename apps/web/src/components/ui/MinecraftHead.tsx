"use client";

import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Skin {
  skinUrl: string;
}

type State = { status: "loading" } | { status: "missing" } | { status: "ready"; url: string; height: number };

/** Un même joueur apparaît souvent plusieurs fois sur une page : une seule requête par pseudo. */
const skinRequests = new Map<string, Promise<Skin>>();

function requestSkin(username: string): Promise<Skin> {
  const key = username.toLowerCase();
  let request = skinRequests.get(key);
  if (!request) {
    request = apiFetch<Skin>(`/skins/${encodeURIComponent(username)}`);
    // Un échec (Mojang indisponible) pourra être retenté plus tard.
    request.catch(() => skinRequests.delete(key));
    skinRequests.set(key, request);
  }
  return request;
}

/**
 * Tête Minecraft dessinée à partir du vrai skin du joueur (lu chez Mojang
 * par l'API, /skins/:pseudo) : le visage, puis le calque du dessus (cheveux,
 * casque…). Les services d'avatars tiers renvoyaient Steve ou Alex à la place
 * du vrai skin. Remplit son conteneur ; `fallback` s'affiche si le pseudo
 * n'est pas un compte officiel ou si Mojang ne répond pas.
 */
export function MinecraftHead({
  username,
  fallback = null,
  className,
}: {
  username: string;
  fallback?: ReactNode;
  className?: string;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    requestSkin(username)
      .then(({ skinUrl }) => {
        // Les anciens skins font 64×32 : la hauteur change le calcul du cadrage.
        const img = new Image();
        img.onload = () => !cancelled && setState({ status: "ready", url: skinUrl, height: img.naturalHeight || 64 });
        img.onerror = () => !cancelled && setState({ status: "missing" });
        img.src = skinUrl;
      })
      .catch(() => !cancelled && setState({ status: "missing" }));
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (state.status === "missing") return <>{fallback}</>;
  if (state.status === "loading") {
    return <span className={cn("block h-full w-full animate-pulse bg-white/5", className)} aria-hidden />;
  }

  // Une zone de 8×8 pixels du skin remplit la boîte : visage en (8,8), calque en (40,8).
  const rows = state.height / 8;
  const y = `${(1 / (rows - 1)) * 100}%`;
  return (
    <span
      role="img"
      aria-label={`Tête Minecraft de ${username}`}
      className={cn("block h-full w-full [image-rendering:pixelated]", className)}
      style={{
        backgroundImage: `url("${state.url}"), url("${state.url}")`,
        backgroundSize: `800% ${rows * 100}%`,
        backgroundPosition: `${(40 / 56) * 100}% ${y}, ${(8 / 56) * 100}% ${y}`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
