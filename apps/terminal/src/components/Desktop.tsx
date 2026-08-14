import { DoorOpen } from "lucide-react";

interface DesktopProps {
  showDirectorShortcut: boolean;
  onOpenDirectorOffice: () => void;
}

export function Desktop({ showDirectorShortcut, onOpenDirectorOffice }: DesktopProps) {
  return (
    <div className="workstation-desktop pointer-events-none absolute inset-0">
      <div className="workstation-wallpaper absolute inset-0" />

      {showDirectorShortcut && (
        <button
          type="button"
          onClick={onOpenDirectorOffice}
          className="pointer-events-auto absolute left-6 top-6 flex w-36 flex-col items-center gap-2 border border-redlake/40 bg-panel/90 p-3 text-center shadow-lg backdrop-blur-sm transition-colors hover:border-redlake hover:bg-redlake/10"
        >
          <div className="flex h-10 w-10 items-center justify-center bg-redlake/20 text-redlake">
            <DoorOpen className="h-5 w-5" />
          </div>
          <span className="text-[10px] leading-tight text-foreground">
            Bureau du Directeur
          </span>
          <span className="text-[9px] text-redlake">Convocation urgente</span>
        </button>
      )}

      <div className="pointer-events-none absolute bottom-4 right-4 text-[9px] text-metal/40">
        SITE-12 — REDLAKES TERMINAL
      </div>
    </div>
  );
}
