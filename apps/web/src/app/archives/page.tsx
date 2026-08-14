import { FileText } from "lucide-react";
import { ArchivesClassified } from "@/components/archives/ArchivesClassified";

export const metadata = {
  title: "Archives Classifiées",
  description: "Documents classifiés du Site-12 — accès selon habilitation réelle.",
};

export default function ArchivesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          SYSTÈME D&apos;HABILITATION
        </p>
        <h1 className="text-4xl font-bold text-white">Archives Classifiées</h1>
        <p className="mt-4 text-gray-500">
          Contenu visible selon votre niveau d&apos;habilitation (dérivé de votre grade
          in-game). Connexion requise — les documents classifiés ne sont plus simulables.
        </p>
      </div>

      <ArchivesClassified />

      <div className="mt-8 flex items-center gap-2 font-mono text-xs text-gray-600">
        <FileText className="h-4 w-4" />
        Déposez vos rapports RP sur le{" "}
        <a href="/intranet" className="text-redlake-glow hover:underline">
          terminal intranet
        </a>
        .
      </div>
    </div>
  );
}
