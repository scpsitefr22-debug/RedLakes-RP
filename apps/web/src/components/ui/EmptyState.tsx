import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  /** Ce qu'on peut faire pour remplir la page (lien, bouton). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Page ou liste vide : un encadré qui dit ce qui apparaîtra ici et comment,
 * au lieu d'une ligne de texte perdue dans la page.
 */
export function EmptyState({ title, hint, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center border border-dashed border-line-strong bg-white/[0.015] px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center border border-line bg-black/40 text-gray-500">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-display mt-4 text-xl font-bold uppercase tracking-[0.04em] text-gray-200">{title}</p>
      {hint && <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
