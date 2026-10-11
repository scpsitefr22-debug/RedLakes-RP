"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { MinecraftHead } from "@/components/ui/MinecraftHead";
import { cn } from "@/lib/utils";

/** Avatar généré par un service tiers : ils renvoyaient Steve/Alex au lieu du vrai skin. */
function isGeneratedHead(url: string) {
  return /mc-heads\.net|crafatar\.com|minotar\.net/i.test(url);
}

/**
 * Avatar d'un joueur : sa photo Discord s'il en a une, sinon la tête de son
 * vrai skin Minecraft (MinecraftHead). `className` porte la taille, la forme
 * et la bordure, comme l'ancienne balise image.
 */
export function PlayerAvatar({
  avatarUrl,
  minecraftUsername,
  alt,
  className,
}: {
  avatarUrl?: string | null;
  minecraftUsername?: string | null;
  alt: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = (imageClass: string) =>
    avatarUrl && !imageFailed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={alt}
        onError={() => setImageFailed(true)}
        className={cn("object-cover [image-rendering:pixelated]", imageClass)}
      />
    ) : (
      <span className={cn("flex items-center justify-center bg-black/40 text-gray-500", imageClass)} aria-hidden>
        <User className="h-1/2 w-1/2" />
      </span>
    );

  if (minecraftUsername && (!avatarUrl || isGeneratedHead(avatarUrl))) {
    return (
      <span className={cn("inline-block shrink-0 overflow-hidden", className)}>
        <MinecraftHead username={minecraftUsername} fallback={image("h-full w-full")} />
      </span>
    );
  }
  return image(cn("shrink-0", className));
}
