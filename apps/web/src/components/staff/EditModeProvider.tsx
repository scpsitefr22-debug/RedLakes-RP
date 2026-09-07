"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface EditModeContextValue {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  return (
    <EditModeContext.Provider value={{ editMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

/** Hors provider (ne devrait pas arriver — monté à la racine), retombe sur "jamais actif". */
export function useEditMode(): EditModeContextValue {
  return useContext(EditModeContext) ?? { editMode: false, setEditMode: () => {} };
}
