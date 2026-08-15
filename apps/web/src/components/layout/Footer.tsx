import Link from "next/link";
import { Shield, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-redlake/20 bg-classified">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-redlake-glow" />
              <span className="font-mono text-sm font-bold tracking-widest">
                REDLAKES RP
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Le secret doit être préservé. Encyclopédie officielle du serveur SCP
              / DarkRP.
            </p>
            {siteConfig.discordInvite && (
              <a
                href={siteConfig.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded border border-[#5865F2]/40 bg-[#5865F2]/10 px-3 py-2 text-sm text-[#aab1ff] transition-colors hover:border-[#5865F2] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                {siteConfig.discordLabel}
              </a>
            )}
          </div>
          <div>
            <h4 className="mb-3 font-mono text-xs tracking-wider text-redlake-glow">
              ENCYCLOPÉDIE
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/wiki" className="hover:text-white">Wiki SCP</Link></li>
              <li><Link href="/lore" className="hover:text-white">Lore</Link></li>
              <li><Link href="/carte" className="hover:text-white">Carte interactive</Link></li>
              <li><Link href="/chronologie" className="hover:text-white">Chronologie</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-mono text-xs tracking-wider text-redlake-glow">
              ORGANISATIONS
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/factions/fondation" className="hover:text-white">Fondation SCP</Link></li>
              <li><Link href="/factions/aegis" className="hover:text-white">A.E.G.I.S.</Link></li>
              <li><Link href="/departements" className="hover:text-white">Départements</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-mono text-xs tracking-wider text-redlake-glow">
              SYSTÈMES
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/candidatures" className="hover:text-white">Candidatures</Link></li>
              <li><Link href="/cassie" className="hover:text-white">CASSIE IA</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Tableau de bord</Link></li>
              <li><Link href="/archives" className="hover:text-white">Archives classifiées</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-metal pt-8 sm:flex-row">
          <p className="font-mono text-xs text-gray-600">
            © 2026 REDLAKES RP — Site-12 // Classification : Interne
          </p>
          <p className="font-mono text-xs text-gray-600">
            SCP RP × DarkRP × Univers Original
          </p>
        </div>
      </div>
    </footer>
  );
}
