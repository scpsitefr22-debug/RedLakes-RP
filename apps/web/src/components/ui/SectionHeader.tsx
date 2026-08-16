import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  align?: "left" | "center";
  action?: { label: string; href: string };
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  icon: Icon,
  align = "left",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 flex flex-wrap items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        <p className="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-redlake-glow">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {kicker}
        </p>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
        {description && (
          <p className="mt-3 max-w-2xl text-gray-500">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex shrink-0 items-center gap-1 font-mono text-xs text-gray-500 transition-colors hover:text-redlake-glow"
        >
          {action.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
