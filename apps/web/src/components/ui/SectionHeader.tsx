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
        <p className={cn("label-mono mb-3 flex items-center gap-2 text-redlake-glow", align === "center" && "justify-center")}>
          {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className="h-px w-8 bg-redlake-glow" aria-hidden />}
          {kicker}
        </p>
        <h2 className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-[0.03em] text-white sm:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="label-mono flex shrink-0 items-center gap-1.5 border-b border-line pb-1 text-gray-400 transition-colors hover:border-redlake-glow hover:text-white"
        >
          {action.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
