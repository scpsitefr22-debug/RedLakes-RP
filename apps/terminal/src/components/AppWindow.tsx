import { type ReactNode } from "react";
import { X, Minus } from "lucide-react";

interface AppWindowProps {
  title: string;
  children: ReactNode;
  isFocused: boolean;
  onFocus: () => void;
  onClose: () => void;
  zIndex: number;
  offsetIndex?: number;
}

export function AppWindow({
  title,
  children,
  isFocused,
  onFocus,
  onClose,
  zIndex,
  offsetIndex = 0,
}: AppWindowProps) {
  const offset = Math.min(offsetIndex, 6) * 28;

  return (
    <div
      className="absolute flex flex-col border bg-panel shadow-2xl"
      style={{
        zIndex,
        top: 24 + offset,
        left: 48 + offset,
        right: 24,
        bottom: 24,
        borderColor: isFocused ? "rgba(139, 10, 10, 0.5)" : "var(--panel-border)",
      }}
      onMouseDown={onFocus}
    >
      <div
        className={`flex items-center justify-between border-b border-panel-border px-3 py-2 ${
          isFocused ? "bg-classified" : "bg-panel"
        }`}
      >
        <span className="truncate text-xs text-foreground">{title}</span>
        <div className="flex gap-1">
          <button type="button" className="p-1 text-metal hover:text-foreground" aria-label="Réduire">
            <Minus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-metal hover:text-redlake"
            aria-label="Fermer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
