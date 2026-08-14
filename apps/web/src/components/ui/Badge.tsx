import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "safe" | "euclid" | "keter" | "classified";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        variant === "default" && "border-metal text-gray-400",
        variant === "safe" && "border-green-400/30 bg-green-400/10 text-green-400",
        variant === "euclid" && "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
        variant === "keter" && "border-red-400/30 bg-red-400/10 text-red-400",
        variant === "classified" && "border-redlake/30 bg-redlake/10 text-redlake-glow",
        className
      )}
    >
      {children}
    </span>
  );
}
