import { IncidentReportReader } from "@/components/documents/IncidentReportReader";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Rapport d'incident — ${slug}` };
}

export default async function IncidentReportDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <IncidentReportReader slug={slug} />
    </div>
  );
}
