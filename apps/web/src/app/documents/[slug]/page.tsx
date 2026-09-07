import { ClassifiedDocumentReader } from "@/components/documents/ClassifiedDocumentReader";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Document — ${slug}` };
}

export default async function ClassifiedDocumentDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ClassifiedDocumentReader slug={slug} />
    </div>
  );
}
