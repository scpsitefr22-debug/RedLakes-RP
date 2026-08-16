import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, Banknote, MapPin, ShieldCheck, Users } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { SITE_SECTION_LABELS, type SiteSection } from "@/lib/grade-access";
import {
  BRANCH_LABELS,
  TIER_LABELS,
  getAccessZoneDescription,
  getAccessZoneLabel,
  type ApiGrade,
} from "@/lib/grade-labels";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getGrade(slug: string): Promise<ApiGrade | null> {
  try {
    const res = await fetch(`${API_URL}/grades/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const grade = await getGrade(slug);
  return { title: grade ? `${grade.name} — Grades Site-12` : "Grade introuvable" };
}

export default async function GradeDetailPage({ params }: Props) {
  const { slug } = await params;
  const grade = await getGrade(slug);
  if (!grade) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 hologram-border rounded-lg p-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          {BRANCH_LABELS[grade.branch] ?? grade.branch}
        </p>
        <h1 className="text-4xl font-bold text-white">{grade.name}</h1>
        {grade.departmentRef && (
          <p className="mt-2 text-gray-500">
            Département :{" "}
            <Link
              href={`/departements/${grade.departmentRef.slug}`}
              className="text-redlake-glow hover:underline"
            >
              {grade.departmentRef.name}
            </Link>
          </p>
        )}
        {grade.tier && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{TIER_LABELS[grade.tier] ?? grade.tier}</Badge>
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
            <Banknote className="h-4 w-4 text-redlake-glow" />
            Rémunération
          </h2>
          <p className="text-2xl font-bold text-white">
            {grade.pay != null ? `${grade.pay.toLocaleString("fr-FR")} $` : "Non renseigné"}
          </p>
          <p className="text-xs text-gray-600">par semaine RP</p>
        </section>

        <section className="hologram-border rounded-lg p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
            <Users className="h-4 w-4 text-redlake-glow" />
            Effectif
          </h2>
          <p className="text-2xl font-bold text-white">{grade.quota ?? "Illimité"}</p>
          <p className="text-xs text-gray-600">quota de postes</p>
        </section>
      </div>

      {grade.description && (
        <section className="mt-6 hologram-border rounded-lg p-6">
          <h2 className="mb-3 text-xl font-bold text-white">Description</h2>
          <p className="text-gray-400">{grade.description}</p>
        </section>
      )}

      {grade.objectives.length > 0 && (
        <section className="mt-6 hologram-border rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-redlake-glow" />
            Missions & objectifs
          </h2>
          <ul className="space-y-2">
            {grade.objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-gray-400">
                <span className="text-redlake-glow">▸</span> {o}
              </li>
            ))}
          </ul>
        </section>
      )}

      {grade.utilities.length > 0 && (
        <section className="mt-6 hologram-border rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Domaines de compétence</h2>
          <div className="flex flex-wrap gap-2">
            {grade.utilities.map((u) => (
              <span
                key={u}
                className="rounded border border-redlake/30 bg-redlake/10 px-3 py-1 text-sm text-gray-300"
              >
                {u}
              </span>
            ))}
          </div>
        </section>
      )}

      {grade.accessZones.length > 0 && (
        <section className="mt-6 hologram-border rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <MapPin className="h-5 w-5 text-redlake-glow" />
            Zones d&apos;accès
          </h2>
          <div className="flex flex-wrap gap-2">
            {grade.accessZones.map((z) => (
              <span
                key={z}
                title={getAccessZoneDescription(z)}
                className="rounded border border-metal px-3 py-1 font-mono text-xs text-gray-400"
              >
                {getAccessZoneLabel(z)}
              </span>
            ))}
          </div>
        </section>
      )}

      {grade.siteSections.length > 0 && (
        <section className="mt-6 hologram-border rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <Award className="h-5 w-5 text-redlake-glow" />
            Sections du site accessibles
          </h2>
          <div className="flex flex-wrap gap-2">
            {grade.siteSections.map((s) => (
              <Badge key={s}>{SITE_SECTION_LABELS[s as SiteSection] ?? s}</Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
