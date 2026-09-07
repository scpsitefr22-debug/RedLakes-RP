"use client";

import { Pencil, PencilOff } from "lucide-react";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { useEditMode } from "./EditModeProvider";

export function EditModeToggle() {
  const { authenticated, role } = usePlayerSession();
  const { editMode, setEditMode } = useEditMode();

  if (!authenticated || (role !== "STAFF" && role !== "ADMIN")) return null;

  return (
    <button
      type="button"
      onClick={() => setEditMode(!editMode)}
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full border px-4 py-3 font-mono text-xs shadow-lg backdrop-blur transition-colors ${
        editMode
          ? "border-green-400 bg-green-400/20 text-green-400 hover:bg-green-400/30"
          : "border-redlake bg-black/80 text-redlake-glow hover:bg-redlake/20"
      }`}
      title="Édition rapide du contenu de la page (STAFF)"
    >
      {editMode ? <Pencil className="h-4 w-4" /> : <PencilOff className="h-4 w-4" />}
      {editMode ? "Édition active" : "Mode édition"}
    </button>
  );
}
