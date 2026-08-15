import { notFound } from "next/navigation";
import { getFaction } from "@/lib/faction-api";
import { getFactionTheme } from "@/lib/faction-themes";
import { getFactionRoleCategories } from "@/data/faction-role-catalog";
import { FactionThemeScope } from "@/components/factions/FactionThemeScope";
import { FactionHero } from "@/components/factions/FactionHero";
import { FactionDepartmentsGrid } from "@/components/factions/FactionDepartmentsGrid";
import { FactionRoleCategoriesPanel } from "@/components/factions/FactionRoleCategoriesPanel";
import { Building2, Target, Users } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const faction = await getFaction(id);
  return { title: faction?.name ?? "Faction introuvable" };
}

export default async function FactionDetailPage({ params }: Props) {
  const { id } = await params;
  const faction = await getFaction(id);
  if (!faction) notFound();

  const theme = getFactionTheme(faction.slug);
  const roleCategories = getFactionRoleCategories(faction.slug);
  const totalRoles = roleCategories.reduce((n, c) => n + c.roles.length, 0);

  return (
    <FactionThemeScope theme={theme} as="section" className="mx-auto max-w-4xl px-4 py-12">
      <FactionHero
        faction={faction}
        theme={theme}
        totalRoles={totalRoles}
        roleCategoryCount={roleCategories.length}
      />

      <div className="prose-redlake space-y-8">
        {faction.description && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 text-xl font-bold text-white">Description</h2>
            <p>{faction.description}</p>
          </section>
        )}

        {faction.history && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 text-xl font-bold text-white">Historique</h2>
            <p>{faction.history}</p>
          </section>
        )}

        {faction.objectives.length > 0 && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Target className="h-5 w-5 faction-accent" />
              Objectifs
            </h2>
            <ul className="space-y-2">
              {faction.objectives.map((obj) => (
                <li key={obj} className="flex items-start gap-2 text-gray-400">
                  <span className="faction-accent">▸</span> {obj}
                </li>
              ))}
            </ul>
          </section>
        )}

        {faction.departments.length > 0 && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Building2 className="h-5 w-5 faction-accent" />
              Départements
            </h2>
            <FactionDepartmentsGrid departments={faction.departments} />
          </section>
        )}

        {roleCategories.length > 0 && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-2 flex items-center gap-2 text-xl font-bold text-white">
              <Users className="h-5 w-5 faction-accent" />
              Rôles & catégories
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              {faction.slug === "fondation"
                ? "Organigramme Site-12. Promotions au mérite RP — pas de niveaux auto. Elite/Prestige = titres en plus, pas des grades."
                : faction.slug === "crime"
                  ? "Organisations illégales créées librement par les joueurs (gang, mafia, MC, cartel…). Pas de rôles fixes à prendre."
                  : "Hiérarchie et rôles de cette faction, avec missions et accès site."}
            </p>
            <FactionRoleCategoriesPanel factionId={faction.slug} accentColor={theme.colors.primary} />
          </section>
        )}
      </div>
    </FactionThemeScope>
  );
}
