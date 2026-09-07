import { ClassifiedDocumentsCatalog } from "@/components/documents/ClassifiedDocumentsCatalog";

export const metadata = { title: "Documents classifiés" };

export default function ClassifiedDocumentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ARCHIVES RESTREINTES
        </p>
        <h1 className="text-4xl font-bold text-white">Documents classifiés</h1>
        <p className="mt-4 max-w-2xl text-gray-500">
          Dossiers internes de la Fondation et des autres organisations — accès filtré selon
          votre département.
        </p>
      </div>
      <ClassifiedDocumentsCatalog />
    </div>
  );
}
