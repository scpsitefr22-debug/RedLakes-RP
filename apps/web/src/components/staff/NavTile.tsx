import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface NavTileProps {
  icon: LucideIcon;
  label: string;
  caption: string;
  href: string;
}

export function NavTile({ icon: Icon, label, caption, href }: NavTileProps) {
  return (
    <Link
      href={href}
      className="panel-flat group p-4 transition-colors hover:border-redlake-glow/60"
    >
      <Icon className="mb-3 h-5 w-5 text-gray-500 transition-colors group-hover:text-redlake-glow" />
      <p className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-white">{label}</p>
      <p className="mt-1 text-xs text-gray-400">{caption}</p>
    </Link>
  );
}
