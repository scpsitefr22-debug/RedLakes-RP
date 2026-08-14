import {
  MessageSquare,
  Mail,
  FolderOpen,
  Database,
  Users,
  Bot,
  FileWarning,
  Calendar,
  Settings,
} from "lucide-react";
import type { AppId } from "../lib/workstation";
import { APP_TITLES } from "../lib/workstation";

const APP_ICONS: Record<AppId, typeof MessageSquare> = {
  messenger: MessageSquare,
  email: Mail,
  documents: FolderOpen,
  "scp-database": Database,
  personnel: Users,
  cassie: Bot,
  "incident-log": FileWarning,
  calendar: Calendar,
  settings: Settings,
};

interface StartMenuProps {
  open: boolean;
  unlockedApps: AppId[];
  openApps: AppId[];
  onOpenApp: (id: AppId) => void;
  onClose: () => void;
}

export function StartMenu({ open, unlockedApps, openApps, onOpenApp, onClose }: StartMenuProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40"
        aria-label="Fermer le menu"
        onClick={onClose}
      />
      <div className="absolute bottom-12 left-2 z-50 w-72 border border-panel-border bg-panel shadow-2xl">
        <div className="border-b border-panel-border bg-classified px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-metal">Applications Site-12</p>
          <p className="mt-0.5 text-xs text-foreground">Terminal sécurisé — Clearance 1</p>
        </div>
        <div className="grid grid-cols-3 gap-1 p-2">
          {unlockedApps.map((id) => {
            const Icon = APP_ICONS[id];
            const isOpen = openApps.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onOpenApp(id);
                  onClose();
                }}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 text-center transition-colors hover:bg-classified ${
                  isOpen ? "bg-redlake/10" : ""
                }`}
              >
                <Icon className={`h-5 w-5 ${isOpen ? "text-terminal" : "text-foreground"}`} />
                <span className="text-[9px] leading-tight text-metal">
                  {APP_TITLES[id].split(" — ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
