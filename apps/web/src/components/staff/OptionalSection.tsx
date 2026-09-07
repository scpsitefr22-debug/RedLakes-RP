"use client";

import type { ReactNode } from "react";
import { useEditMode } from "./EditModeProvider";

/**
 * Enveloppe les sections conditionnelles habituelles ("si ce champ est
 * rempli, afficher le bloc") pour qu'elles restent visibles en mode édition
 * même quand le champ est vide — sinon impossible de cliquer pour ajouter un
 * premier contenu à un champ qui n'en a jamais eu.
 */
export function OptionalSection({ show, children }: { show: boolean; children: ReactNode }) {
  const { editMode } = useEditMode();
  if (!show && !editMode) return null;
  return <>{children}</>;
}
