"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Shield,
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  MessageCircle,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { GlobalSearch } from "./GlobalSearch";
import { HeaderAuth } from "./HeaderAuth";

const navItems = [
  {
    label: "Encyclopédie",
    href: "/wiki",
    children: [
      { label: "Wiki SCP", href: "/wiki" },
      { label: "Lore", href: "/lore" },
      { label: "Personnages", href: "/personnages" },
      { label: "Événements", href: "/evenements" },
      { label: "Chronologie", href: "/chronologie" },
    ],
  },
  {
    label: "Organisations",
    href: "/factions",
    children: [
      { label: "Factions", href: "/factions" },
      { label: "MTF", href: "/factions/mtf" },
      { label: "Départements", href: "/departements" },
      { label: "Site-12", href: "/departements/site-12" },
      { label: "Grades", href: "/grades" },
    ],
  },
  { label: "Carte", href: "/carte" },
  { label: "Actualités", href: "/actualites" },
  { label: "Transmissions", href: "/transmissions" },
  { label: "Galerie", href: "/galerie" },
  {
    label: "Systèmes",
    href: "/candidatures",
    children: [
      { label: "Candidatures", href: "/candidatures" },
      { label: "Intranet Site-12", href: "/intranet" },
      { label: "Joueurs", href: "/joueurs" },
      { label: "Archives classifiées", href: "/archives" },
      { label: "CASSIE IA", href: "/cassie" },
      { label: "CMS Lore (Staff)", href: "/lore/cms" },
      { label: "Gestion Grades (Staff)", href: "/staff/grades" },
      { label: "Gestion Factions (Staff)", href: "/staff/factions" },
      { label: "Gestion Départements (Staff)", href: "/staff/departements" },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-redlake/30 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded border border-redlake/50 bg-redlake/10">
              <Shield className="h-5 w-5 text-redlake-glow" />
              <div className="absolute inset-0 rounded bg-redlake/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="hidden sm:block">
              <p className="font-mono text-sm font-bold tracking-widest text-white">
                REDLAKES RP
              </p>
              <p className="text-[10px] tracking-wider text-metal-light">
                SITE-12 // CLASSIFIÉ
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 transition-colors hover:text-redlake-glow"
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3" />}
                </Link>
                {item.children && openDropdown === item.label && (
                  <div className="absolute left-0 top-full min-w-[200px] border border-redlake/20 bg-black/95 py-2 shadow-xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-400 hover:bg-redlake/10 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded border border-metal p-2 text-gray-400 transition-colors hover:border-redlake hover:text-white"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>
            <HeaderAuth />
            {siteConfig.discordInvite && (
              <a
                href={siteConfig.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded border border-[#5865F2]/40 bg-[#5865F2]/10 px-3 py-2 text-xs font-mono text-[#aab1ff] transition-colors hover:border-[#5865F2] hover:text-white sm:block"
                aria-label={siteConfig.discordLabel}
              >
                <MessageCircle className="mr-1 inline h-3 w-3" />
                DISCORD
              </a>
            )}
            <Link
              href="/connexion"
              className="rounded border border-metal p-2 text-gray-400 sm:hidden"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded border border-metal p-2 text-gray-400 lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-redlake/20 bg-black/95 px-4 py-4 lg:hidden">
            {navItems.map((item) => (
              <div key={item.label} className="mb-2">
                <Link
                  href={item.href}
                  className="block py-2 font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block py-1 pl-4 text-sm text-gray-400"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            {siteConfig.discordInvite && (
              <a
                href={siteConfig.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 py-2 font-medium text-[#aab1ff]"
                onClick={() => setMobileOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                Discord
              </a>
            )}
          </nav>
        )}
      </header>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
