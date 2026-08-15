import type { CSSProperties, ReactNode } from "react";
import type { FactionTheme } from "@/lib/faction-themes";
import { cn } from "@/lib/utils";

interface Props {
  theme: FactionTheme;
  children: ReactNode;
  className?: string;
  /** Passe en `<section>`/`<article>` etc. — défaut `div` */
  as?: "div" | "article" | "section";
}

/**
 * Pose l'ambiance d'une faction sur son sous-arbre : variables CSS de
 * palette, police de titre (via next/font `.variable`), et calque de
 * texture de fond dépendant du `data-motif`. Voir les règles
 * `[data-faction="…"]` / `[data-motif="…"]` dans globals.css.
 *
 * Ne touche jamais au Header/Footer — n'enveloppe que la zone de contenu.
 */
export function FactionThemeScope({ theme, children, className, as = "div" }: Props) {
  const Comp = as;
  const style = {
    "--f-primary": theme.colors.primary,
    "--f-secondary": theme.colors.secondary,
    "--f-accent": theme.colors.accent,
    "--f-glow": theme.colors.glow,
    "--f-surface": theme.rgba.surface,
    "--f-border": theme.rgba.border,
    "--f-heading-font": theme.headingFont,
  } as CSSProperties;

  return (
    <Comp
      data-faction={theme.slug}
      data-motif={theme.motif}
      data-motion={theme.motion}
      className={cn("faction-scope", theme.fontVariable, className)}
      style={style}
    >
      <div className="faction-texture" aria-hidden="true" />
      <div className="faction-scan-beam" aria-hidden="true" />
      <div className="faction-scope-content">{children}</div>
    </Comp>
  );
}
