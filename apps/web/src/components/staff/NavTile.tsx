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
      className="panel-flat rounded-lg p-5 transition-colors hover:border-redlake/30"
    >
      <Icon className="mb-3 h-5 w-5 text-gray-500" />
      <p className="font-bold text-white">{label}</p>
      <p className="mt-1 text-xs text-gray-600">{caption}</p>
    </Link>
  );
}
