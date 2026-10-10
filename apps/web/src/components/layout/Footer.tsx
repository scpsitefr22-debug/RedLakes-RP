import Link from "next/link";
import { Shield, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

const COLUMNS = [
  {
    title: "Encyclopédie",
    links: [
      { label: "Wiki SCP", href: "/wiki" },
      { label: "Lore", href: "/lore" },
      { label: "Chronologie", href: "/chronologie" },
    ],
  },
  {
    title: "Organisations",
    links: [
      { label: "Fondation SCP", href: "/factions/fondation" },
      { label: "A.E.G.I.S.", href: "/factions/aegis" },
      { label: "Départements", href: "/departements" },
      { label: "Grades", href: "/grades" },
    ],
  },
  {
    title: "Systèmes",
    links: [
      { label: "Candidatures", href: "/candidatures" },
      { label: "Tableau de bord", href: "/dashboard" },
      { label: "Archives classifiées", href: "/archives" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-[#05070a]">
      <div className="hazard-stripes h-1 opacity-80" aria-hidden />
      <div className="mx-auto max-w-[1440px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-redlake/60 bg-redlake/10">
                <Shield className="h-4 w-4 text-redlake-glow" />
              </span>
              <span className="font-display text-2xl font-bold uppercase tracking-[0.08em] text-white">
                Redlakes RP
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Sécuriser. Contenir. Protéger. L&apos;encyclopédie officielle du serveur SCP / DarkRP
              du Site-12.
            </p>
            {siteConfig.discordInvite && (
              <a
                href={siteConfig.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 border border-[#5865F2]/50 bg-[#5865F2]/10 px-4 py-2 text-sm text-[#c3c8ff] transition-colors hover:border-[#5865F2] hover:bg-[#5865F2]/20 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                {siteConfig.discordLabel}
              </a>
            )}
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="label-mono mb-4 text-redlake-glow">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="label-mono text-[10px] text-gray-600">
            © 2026 Redlakes RP — Site-12 // Classification : interne
          </p>
          <p className="label-mono text-[10px] text-gray-600">SCP RP × DarkRP × univers original</p>
        </div>
      </div>
    </footer>
  );
}
