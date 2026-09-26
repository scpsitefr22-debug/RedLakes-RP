import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getFaction,
  getFactionRelations,
  getFactionMembers,
  FACTION_RELATION_LABELS,
  FACTION_RELATION_COLORS,
  type FactionEvent,
  type FactionScpObject,
} from "@/lib/faction-api";
import type { ClassifiedDocumentSummary } from "@/lib/classified-documents-api";
import { getFactionTheme } from "@/lib/faction-themes";
import { getFactionRoleCategories } from "@/data/faction-role-catalog";
import { API_URL } from "@/lib/api";
import { FactionThemeScope } from "@/components/factions/FactionThemeScope";
import { FactionHero } from "@/components/factions/FactionHero";
import { FactionDepartmentsGrid } from "@/components/factions/FactionDepartmentsGrid";
import { FactionRoleCategoriesPanel } from "@/components/factions/FactionRoleCategoriesPanel";
import { EditableText } from "@/components/staff/EditableText";
import { OptionalSection } from "@/components/staff/OptionalSection";
import {
  Building2,
  Handshake,
  Target,
  Users,
  UserCheck,
  Banknote,
  Coins,
  Swords,
  FileLock2,
  Radio,
  BookOpen,
} from "lucide-react";

const SCP_CLASS_COLORS: Record<FactionScpObject["class"], string> = {
  Safe: "text-green-400",
  Euclid: "text-yellow-400",
  Keter: "text-red-400",
  Thaumiel: "text-purple-400",
  Apollyon: "text-orange-400",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  breach: "Brèche",
  invasion: "Invasion",
  guerre: "Guerre",
  "crise-xk": "Crise XK",
  experience: "Expérience",
};

/**
 * Fetch server-side avec le cookie de session du visiteur transmis (meme
 * principe que getScpObject dans wiki/[id]/page.tsx) — indispensable ici :
 * les evenements d'une faction peuvent etre restreints par departement
 * (restrictedDepartmentIds), donc un fetch anonyme (via apiFetch/getFactions*
 * standard, sans cookie) ne montrerait jamais les evenements reserves aux
 * membres habilites de la faction elle-meme.
 */
async function getFactionEvents(slug: string): Promise<FactionEvent[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("redlakes_token")?.value;
  try {
    const res = await fetch(`${API_URL}/factions/${slug}/events`, {
      cache: "no-store",
      headers: token ? { Cookie: `redlakes_token=${token}` } : undefined,
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Documents classifies publies (tous, non filtres par faction ici) —
 * getClassifiedDocuments() de classified-documents-api.ts est inutilisable
 * ici : elle passe par apiFetch (chemin relatif "/api/...", pensee pour un
 * appel navigateur avec cookie de session automatique) alors que cette
 * fonction tourne cote serveur (Server Component), ou un chemin relatif ne
 * resout rien pour le fetch natif de Node — l'appel echouait silencieusement
 * (catch -> []), section "Documents classifies" jamais affichee malgre des
 * documents publics reels. Meme raison/pattern que getFactionEvents.
 */
async function getFactionDocuments(): Promise<ClassifiedDocumentSummary[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("redlakes_token")?.value;
  try {
    const res = await fetch(`${API_URL}/classified-documents`, {
      cache: "no-store",
      headers: token ? { Cookie: `redlakes_token=${token}` } : undefined,
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Objets SCP associes a la faction — composes cote API a partir de la
 * relation ClassifiedDocument<->ScpObject deja posee (Lot 40), aucune
 * relation directe Faction<->ScpObject en base. Meme raison de fetch
 * local avec cookie que getFactionEvents ci-dessus.
 */
async function getFactionScpObjects(slug: string): Promise<FactionScpObject[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("redlakes_token")?.value;
  try {
    const res = await fetch(`${API_URL}/factions/${slug}/scp`, {
      cache: "no-store",
      headers: token ? { Cookie: `redlakes_token=${token}` } : undefined,
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

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
  const { icon: Icon, ...heroTheme } = theme;
  const roleCategories = getFactionRoleCategories(faction.slug);
  const totalRoles = roleCategories.reduce((n, c) => n + c.roles.length, 0);
  const [relations, members, allDocuments, events, scpObjects] = await Promise.all([
    getFactionRelations(faction.id),
    getFactionMembers(faction.slug),
    getFactionDocuments(),
    getFactionEvents(faction.slug),
    getFactionScpObjects(faction.slug),
  ]);
  const documents = allDocuments.filter((d) => d.faction?.slug === faction.slug);
  const allyCount = relations.filter((r) => r.status === "ALLIE").length;
  const hostileCount = relations.filter((r) => r.status === "HOSTILE").length;

  return (
    <FactionThemeScope theme={theme} as="section" className="mx-auto max-w-4xl px-4 py-12">
      <FactionHero
        faction={faction}
        theme={heroTheme}
        icon={<Icon className="h-6 w-6" />}
        totalRoles={totalRoles}
        roleCategoryCount={roleCategories.length}
      />

      <div
        className={`mb-8 grid grid-cols-2 gap-3 ${faction.budget != null ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}
      >
        <div className="faction-card p-4 text-center">
          <UserCheck className="mx-auto mb-2 h-5 w-5 faction-accent" />
          <p className="text-2xl font-bold text-white">{faction.memberCount}</p>
          <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">Membres actifs</p>
        </div>
        <div className="faction-card p-4 text-center">
          <Building2 className="mx-auto mb-2 h-5 w-5 faction-accent" />
          <p className="text-2xl font-bold text-white">{faction.departments.length}</p>
          <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">Départements</p>
        </div>
        <div className="faction-card p-4 text-center">
          <Banknote className="mx-auto mb-2 h-5 w-5 faction-accent" />
          <p className="text-2xl font-bold text-white">
            {faction.topGrade ? `${faction.topGrade.pay.toLocaleString("fr-FR")} $` : "—"}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">
            {faction.topGrade ? `Meilleur salaire (${faction.topGrade.name})` : "Salaires"}
          </p>
        </div>
        <div className="faction-card p-4 text-center">
          <Swords className="mx-auto mb-2 h-5 w-5 faction-accent" />
          <p className="text-2xl font-bold text-white">{allyCount} / {hostileCount}</p>
          <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">Alliées / Hostiles</p>
        </div>
        {faction.budget != null && (
          <div className="faction-card p-4 text-center">
            <Coins className="mx-auto mb-2 h-5 w-5 faction-accent" />
            <p className="text-2xl font-bold text-white">{faction.budget.toLocaleString("fr-FR")} $</p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">Budget</p>
          </div>
        )}
      </div>

      <div className="prose-redlake space-y-8">
        {roleCategories.length > 0 && (
          <section className="faction-card p-6">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-gray-600">
              Guide pratique — hors RP
            </p>
            <h2 className="faction-heading mb-2 flex items-center gap-2 text-xl font-bold text-white">
              <Users className="h-5 w-5 faction-accent" />
              Ce que tu fais dans cette faction
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

        {events.length > 0 && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Radio className="h-5 w-5 faction-accent" />
              Activité récente
            </h2>
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/evenements/${e.slug}`}
                    className="flex items-center justify-between gap-3 rounded border border-metal/40 p-3 transition-colors hover:border-redlake/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{e.title}</p>
                      <p className="truncate text-xs text-gray-500">{e.outcome}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-wide faction-accent">
                        {EVENT_TYPE_LABELS[e.type] ?? e.type}
                      </span>
                      <span className="font-mono text-[10px] text-gray-600">
                        {new Date(e.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <OptionalSection show={!!faction.description}>
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 text-xl font-bold text-white">Description</h2>
            <EditableText
              value={faction.description}
              endpoint={`/factions/${faction.id}`}
              field="description"
              multiline
              markdown
              placeholder="Cliquer pour ajouter une description…"
            />
          </section>
        </OptionalSection>

        <OptionalSection show={!!faction.history}>
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 text-xl font-bold text-white">Historique</h2>
            <EditableText
              value={faction.history}
              endpoint={`/factions/${faction.id}`}
              field="history"
              multiline
              markdown
              placeholder="Cliquer pour ajouter un historique…"
            />
          </section>
        </OptionalSection>

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

        {relations.length > 0 && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Handshake className="h-5 w-5 faction-accent" />
              Relations diplomatiques
            </h2>
            <ul className="flex flex-wrap gap-2">
              {relations.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/factions/${r.faction.slug}`}
                    className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm transition-colors hover:bg-white/5 ${FACTION_RELATION_COLORS[r.status]}`}
                    title={r.note ?? undefined}
                  >
                    <span className="font-bold text-white">{r.faction.name}</span>
                    <span className="font-mono text-xs uppercase tracking-wide">
                      {FACTION_RELATION_LABELS[r.status]}
                    </span>
                  </Link>
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

        {members.length > 0 && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <UserCheck className="h-5 w-5 faction-accent" />
              Membres ({members.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((m, i) => {
                const identifier = m.minecraftUsername ?? m.username;
                const name = [m.rpFirstName, m.rpLastName].filter(Boolean).join(" ") || identifier || "Agent";
                const card = (
                  <div className="flex items-center gap-3 rounded border border-metal/40 p-3 transition-colors hover:border-redlake/30">
                    {m.avatarUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatarUrl} alt="" className="h-8 w-8 rounded" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{name}</p>
                      <p className="truncate font-mono text-xs text-gray-500">{m.grade}</p>
                    </div>
                  </div>
                );
                return identifier ? (
                  <Link key={identifier} href={`/joueurs/${encodeURIComponent(identifier)}`}>
                    {card}
                  </Link>
                ) : (
                  <div key={`${name}-${i}`}>{card}</div>
                );
              })}
            </div>
          </section>
        )}

        {documents.length > 0 && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <FileLock2 className="h-5 w-5 faction-accent" />
              Documents classifiés
            </h2>
            <div className="space-y-2">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.slug}`}
                  className="block rounded border border-metal/40 p-3 transition-colors hover:border-redlake/30"
                >
                  <p className="text-sm font-bold text-white">{doc.title}</p>
                  {doc.excerpt && <p className="line-clamp-1 text-xs text-gray-500">{doc.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {scpObjects.length > 0 && (
          <section className="faction-card p-6">
            <h2 className="faction-heading mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <BookOpen className="h-5 w-5 faction-accent" />
              SCP associés
            </h2>
            <div className="space-y-2">
              {scpObjects.map((scp) => (
                <Link
                  key={scp.id}
                  href={`/wiki/${scp.slug}`}
                  className="flex items-center justify-between gap-3 rounded border border-metal/40 p-3 transition-colors hover:border-redlake/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {scp.number} — {scp.name}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-[10px] uppercase tracking-wide ${SCP_CLASS_COLORS[scp.class]}`}
                  >
                    {scp.class}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </FactionThemeScope>
  );
}
