"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { AlertLevelBadge } from "./AlertLevelBadge";
import { usePlayerSession } from "@/hooks/usePlayerSession";

const STAFF_ROLES = new Set(["STAFF", "ADMIN"]);

interface NavChild {
  label: string;
  href: string;
  staffOnly?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
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
      { label: "Départements", href: "/departements" },
      { label: "Site-12", href: "/departements/site-12" },
      { label: "Grades", href: "/grades" },
    ],
  },
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
      { label: "Documents classifiés", href: "/documents" },
      { label: "Rapports d'incident", href: "/rapports-incidents" },
      { label: "OPHIS", href: "/ophis" },
      { label: "CMS Lore (Staff)", href: "/lore/cms", staffOnly: true },
      { label: "Gestion Grades (Staff)", href: "/staff/grades", staffOnly: true },
      { label: "Gestion Rapports (Staff)", href: "/staff/rapports-incidents", staffOnly: true },
      { label: "Gestion Factions (Staff)", href: "/staff/factions", staffOnly: true },
      { label: "Gestion Départements (Staff)", href: "/staff/departements", staffOnly: true },
      { label: "Gestion Équipes (Staff)", href: "/staff/teams", staffOnly: true },
      { label: "Accès & rôles (Admin)", href: "/staff/acces", staffOnly: true },
      { label: "Gestion Joueurs (Staff)", href: "/staff/joueurs", staffOnly: true },
      { label: "Gestion Wiki SCP (Staff)", href: "/staff/scp", staffOnly: true },
      { label: "Gestion Personnages (Staff)", href: "/staff/personnages", staffOnly: true },
      { label: "Gestion Événements (Staff)", href: "/staff/evenements", staffOnly: true },
      { label: "Gestion Actualités (Staff)", href: "/staff/actualites", staffOnly: true },
      { label: "Carte du serveur (Staff)", href: "/staff/carte/vue", staffOnly: true },
      { label: "Gestion Carte (Staff)", href: "/staff/carte", staffOnly: true },
      { label: "Gestion Documents (Staff)", href: "/staff/documents", staffOnly: true },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const session = usePlayerSession();
  const pathname = usePathname() ?? "/";
  const isStaff = STAFF_ROLES.has(session.role ?? "");
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isActive = (item: NavItem) => matches(item.href) || Boolean(item.children?.some((c) => matches(c.href)));

  const visibleNavItems = navItems.map((item) => ({
    ...item,
    children: item.children?.filter((child) => !child.staffOnly || isStaff),
  }));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-[#07090c]/92 backdrop-blur-md">
        {/* Bandeau d'état : où l'on est, et le niveau d'alerte du site. */}
        <div className="hidden border-b border-line/70 bg-black/40 sm:block">
          <div className="mx-auto flex h-7 max-w-[1440px] items-center justify-between gap-4 px-6">
            <p className="label-mono truncate text-gray-500">
              <span className="text-redlake-glow">■</span> Fondation SCP — Site-12 — Réseau indépendant
            </p>
            <div className="flex items-center gap-4">
              <AlertLevelBadge />
              {siteConfig.discordInvite && (
                <a
                  href={siteConfig.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-mono flex items-center gap-1.5 text-[#aab1ff] transition-colors hover:text-white"
                  aria-label={siteConfig.discordLabel}
                >
                  <MessageCircle className="h-3 w-3" />
                  Discord
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="REDLAKES RP — accueil">
            <span className="relative flex h-10 w-10 items-center justify-center border border-redlake/60 bg-redlake/10 transition-colors group-hover:bg-redlake/25">
              <Shield className="h-5 w-5 text-redlake-glow" />
              <span className="absolute -left-px -top-px h-2 w-2 border-l-2 border-t-2 border-redlake-glow" />
              <span className="absolute -bottom-px -right-px h-2 w-2 border-b-2 border-r-2 border-redlake-glow" />
            </span>
            <span className="block leading-none">
              <span className="font-display block text-2xl font-bold uppercase tracking-[0.08em] text-white">
                Redlakes
              </span>
              <span className="label-mono mt-1 hidden text-[10px] text-redlake-glow sm:block">Site-12 // Classifié</span>
            </span>
          </Link>

          <nav className="hidden items-center lg:flex" aria-label="Navigation principale">
            {visibleNavItems.map((item) => {
              const active = isActive(item);
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                  onFocus={() => item.children && setOpenDropdown(item.label)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setOpenDropdown(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setOpenDropdown(null);
                  }}
                >
                  <Link
                    href={item.href}
                    className={`font-display relative flex h-16 items-center gap-1 px-2 text-[15px] font-semibold uppercase tracking-[0.06em] transition-colors xl:px-3 xl:tracking-[0.1em] hover:text-white focus-visible:text-white ${
                      active ? "text-white" : "text-gray-400"
                    }`}
                    aria-haspopup={item.children ? true : undefined}
                    aria-expanded={item.children ? openDropdown === item.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                    {item.children && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
                    <span
                      className={`absolute inset-x-2 bottom-0 h-0.5 bg-redlake-glow xl:inset-x-3 transition-transform duration-200 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                  {item.children && openDropdown === item.label && (
                    <div className="absolute left-0 top-full min-w-[240px] border border-line border-t-redlake-glow bg-[#0b0e13]/98 py-2 shadow-2xl shadow-black/70">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span className="h-1 w-1 bg-redlake-glow/70" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 items-center gap-2 border border-line px-2.5 text-gray-400 transition-colors hover:border-line-strong hover:text-white"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
              <span className="label-mono hidden text-[10px] 2xl:inline">Rechercher</span>
            </button>
            <HeaderAuth />
            <Link
              href="/connexion"
              className="flex h-9 w-9 items-center justify-center border border-line text-gray-400 sm:hidden"
              aria-label="Connexion"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center border border-line text-gray-300 lg:hidden"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-line bg-[#07090c] px-4 py-4 lg:hidden" aria-label="Navigation mobile">
            {visibleNavItems.map((item) => (
              <div key={item.label} className="mb-3">
                <Link
                  href={item.href}
                  className="font-display block py-2 text-lg font-semibold uppercase tracking-[0.1em] text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block border-l border-line py-1.5 pl-4 text-sm text-gray-400"
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
