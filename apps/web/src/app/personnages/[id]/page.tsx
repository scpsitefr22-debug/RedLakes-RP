import { PersonnageDetail } from "@/components/personnages/PersonnageDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PersonnageDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PersonnageDetail id={id} />
    </div>
  );
}
