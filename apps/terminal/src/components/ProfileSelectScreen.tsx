import { useMemo } from "react";
import { motion } from "framer-motion";
import { hasPlayerProfile, type GNSSlotSummary } from "@redlakes/narrative-core";
import { UserPlus, User } from "lucide-react";
import { useGNS } from "../context/GNSContext";

interface ProfileSelectScreenProps {
  onExistingProfile: () => void;
  onNewProfile: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function SlotCard({
  slot,
  onSelect,
}: {
  slot: GNSSlotSummary;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-start gap-3 border border-panel-border bg-classified p-4 text-left transition-colors hover:border-dashboard-accent/50 hover:bg-panel"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashboard-accent/40 bg-dashboard-accent/10 text-dashboard-accent">
        <User size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {slot.hasProfile ? slot.displayName : "Dossier non finalisé"}
        </p>
        <p className="font-mono text-[10px] text-metal">
          {slot.employeeId ?? "ID en attente"}
        </p>
        <p className="mt-1 text-[10px] text-metal/80">
          {slot.chaptersCompleted > 0
            ? `${slot.chaptersCompleted} chapitre${slot.chaptersCompleted > 1 ? "s" : ""} terminé${slot.chaptersCompleted > 1 ? "s" : ""}`
            : "Nouvelle intégration"}
          {" · "}
          {formatDate(slot.updatedAt)}
        </p>
      </div>
    </button>
  );
}

export function ProfileSelectScreen({ onExistingProfile, onNewProfile }: ProfileSelectScreenProps) {
  const { listSaveSlots, activateSave } = useGNS();
  const slots = useMemo(() => listSaveSlots(), [listSaveSlots]);

  const handleSelect = async (saveId: string) => {
    const loaded = await activateSave(saveId);
    if (!loaded) return;
    if (hasPlayerProfile(loaded)) {
      onExistingProfile();
    } else {
      onNewProfile();
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <p className="text-[10px] uppercase tracking-widest text-terminal">Site-12 — Terminal sécurisé</p>
        <h1 className="mt-2 text-xl text-foreground">Choisir un dossier personnel</h1>
        <p className="mt-2 text-xs leading-relaxed text-metal">
          Chaque recrue possède sa propre sauvegarde saga. Pour les tests, créez une nouvelle
          recrue sans effacer les anciens dossiers.
        </p>

        {slots.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-metal">Dossiers enregistrés</p>
            {slots.map((slot) => (
              <SlotCard key={slot.saveId} slot={slot} onSelect={() => void handleSelect(slot.saveId)} />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onNewProfile}
          className="mt-6 flex w-full items-center justify-center gap-2 border border-redlake/50 bg-redlake/10 py-3 text-xs text-foreground transition-colors hover:bg-redlake/20"
        >
          <UserPlus size={16} />
          Nouvelle recrue (nouveau personnage)
        </button>

        {slots.length === 0 && (
          <p className="mt-4 text-center text-[10px] text-metal/70">
            Aucun dossier existant — commencez par créer une nouvelle recrue.
          </p>
        )}
      </motion.div>
    </div>
  );
}
