import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  label: string;
  state?: "online" | "offline" | "warning";
  className?: string;
}

const DOT_COLOR: Record<NonNullable<StatusIndicatorProps["state"]>, string> = {
  online: "bg-terminal shadow-[0_0_8px_rgba(74,222,128,0.7)]",
  offline: "bg-gray-600",
  warning: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]",
};

export function StatusIndicator({ label, state = "online", className }: StatusIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gray-400",
        className
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          DOT_COLOR[state],
          state !== "offline" && "animate-pulse"
        )}
      />
      {label}
    </span>
  );
}
