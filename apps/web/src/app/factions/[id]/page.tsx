import { notFound } from "next/navigation";
import { factions } from "@/data/factions";
import { getFactionRoleCategories } from "@/data/faction-role-catalog";
import { Badge } from "@/components/ui/Badge";
import { CLEARANCE_LABELS } from "@/lib/clearance";
import { FactionRoleCategoriesPanel } from "@/components/factions/FactionRoleCategoriesPanel";
import { Shield, Target, Users } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return factions.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const faction = factions.find((f) => f.id === id);
  return { title: faction?.name ?? "Faction" };
}

export default async function FactionDetailPage({ params }: Props) {
  const { id } = await params;
  const faction = factions.find((f) => f.id === id);
  if (!faction) notFound();

  const roleCategories = getFactionRoleCategories(id);
  const totalRoles = roleCategories.reduce((n, c) => n + c.roles.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div
        className="mb-8 hologram-border rounded-lg p-8"
        style={{ borderTopColor: faction.color, borderTopWidth: 3 }}
      >
        <div className="mb-4 flex items-center gap-4">
          {faction.id === "aegis" && (
            <img src="/logo-aegis.svg" alt="A.E.G.I.S." className="h-16 w-16 shrink-0" />
          )}
          <Shield className="h-8 w-8 shrink-0" style={{ color: faction.color }} />
          <div>
            <h1 className="text-4xl font-bold text-white">{faction.name}</h1>
            <p className="italic text-gray-500">{faction.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="classified">
            {CLEARANCE_LABELS[faction.clearance]}
          </Badge>
          {totalRoles > 0 && (
            <Badge>
              {roleCategories.length} catégories • {totalRoles} rôles
            </Badge>
          )}
        </div>
      </div>

      <div className="prose-redlake space-y-8">
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Description</h2>
          <p>{faction.description}</p>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Historique</h2>
          <p>{faction.history}</p>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <Target className="h-5 w-5 text-redlake-glow" />
            Objectifs
          </h2>
          <ul className="space-y-2">
            {faction.objectives.map((obj) => (
              <li key={obj} className="flex items-start gap-2 text-gray-400">
                <span className="text-redlake-glow">▸</span> {obj}
              </li>
            ))}
          </ul>
        </section>

        {roleCategories.length > 0 && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
              <Users className="h-5 w-5 text-redlake-glow" />
              Rôles & catégories
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              {faction.id === "fondation"
                ? "Organigramme Site-12. Promotions au mérite RP — pas de niveaux auto. Elite/Prestige = titres en plus, pas des grades."
                : faction.id === "crime"
                  ? "Organisations illégales créées librement par les joueurs (gang, mafia, MC, cartel…). Pas de rôles fixes à prendre."
                  : "Hiérarchie et rôles de cette faction, avec missions et accès site."}
            </p>
            <FactionRoleCategoriesPanel factionId={id} />
          </section>
        )}

        {faction.structure && (
          <section className="hologram-border rounded-lg p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Structure</h2>
            <ul className="space-y-1">
              {faction.structure.map((s) => (
                <li key={s} className="text-gray-400">▸ {s}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
