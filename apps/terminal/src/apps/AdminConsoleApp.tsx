import { Lock, Terminal as TerminalIcon } from "lucide-react";
import { useGNSRequired } from "../context/GNSContext";

export function AdminConsoleApp() {
  const { gns } = useGNSRequired();
  const unlocked = Boolean(gns.flags.ch8_admin_console_unlocked);
  const confirmed = Boolean(gns.flags.ch8_project_confirmed);

  if (!unlocked) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <Lock className="h-8 w-8 text-metal/40" />
        <p className="text-xs text-metal">Console administrateur — accès non accordé.</p>
      </div>
    );
  }

  const lines = [
    "> whoami",
    "SYSTEM (CASSIE-CORE, clearance héritée)",
    "> ps --list-legacy",
    "PID 0001  cassie_core.svc        actif",
    "PID 0002  site_status_mirror     actif",
    confirmed
      ? "PID ████  proc_████_watchdog     actif — origine : antérieure au Site-12"
      : "PID ????  [processus non résolu]  actif",
    confirmed ? "> trace proc_████_watchdog" : "> trace ????",
    confirmed
      ? "Résultat : rattaché à l'archive « Projet ████ ». Accès verrouillé clearance 5."
      : "Résultat : données insuffisantes.",
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-dashboard-border bg-[#05080c] px-4 py-2">
        <TerminalIcon className="h-3.5 w-3.5 text-terminal" />
        <span className="text-[10px] uppercase tracking-wider text-metal">Console admin — CASSIE-CORE</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#05080c] p-4 font-mono text-[11px] leading-relaxed text-terminal/90">
        {lines.map((line, i) => (
          <p key={i} className={line.startsWith(">") ? "text-foreground" : ""}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
