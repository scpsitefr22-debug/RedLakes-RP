import { LoreArticleReader } from "@/components/lore/LoreArticleReader";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Lore — ${id}` };
}

export default async function LoreDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <LoreArticleReader slug={id} />
    </div>
  );
}
