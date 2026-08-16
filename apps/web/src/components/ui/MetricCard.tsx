import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  href?: string;
  live?: boolean;
  className?: string;
}

export function MetricCard({ icon: Icon, value, label, href, live, className }: MetricCardProps) {
  const content = (
    <>
      <div className="mb-2 flex items-center justify-between">
        <Icon className="h-5 w-5 text-redlake-glow" />
        {live && (
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-terminal">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-terminal" />
            live
          </span>
        )}
      </div>
      <p className="font-mono text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </>
  );

  const classes = cn(
    "panel-elevated rounded-lg p-4 text-left transition-colors",
    href && "hover:border-redlake/60",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
