import { ClassifiedDocumentEditor } from "@/components/staff/ClassifiedDocumentEditor";

export const metadata = { title: "Nouveau document classifié — Staff" };

export default function NouveauClassifiedDocumentPage() {
  return <ClassifiedDocumentEditor mode="create" />;
}
