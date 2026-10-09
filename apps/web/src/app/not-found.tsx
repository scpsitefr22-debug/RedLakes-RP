import Link from "next/link";
import { ArrowLeft, BookOpen, FileQuestion } from "lucide-react";

export const metadata = { title: "Dossier introuvable" };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-20">
      <div className="hologram-border relative overflow-hidden p-8 sm:p-12">
        <div className="hazard-stripes absolute inset-x-0 top-0 h-1.5" aria-hidden />
        <p className="label-mono flex items-center gap-2 text-redlake-glow">
          <FileQuestion className="h-4 w-4" />
          Erreur 404 — Archives du Site-12
        </p>
        <h1 className="font-display mt-5 text-6xl font-extrabold text-white sm:text-7xl">Dossier introuvable</h1>
        <p className="mt-5 max-w-xl leading-relaxed text-gray-400">
          Ce dossier n&apos;existe pas, a été déplacé, ou a été retiré des archives. Si un lien vous a
          mené ici, il est peut-être périmé.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="font-display flex items-center gap-2 bg-redlake-glow px-6 py-3 text-base font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff4a3f]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/wiki"
            className="font-display flex items-center gap-2 border border-line-strong px-6 py-3 text-base font-bold uppercase tracking-[0.12em] text-gray-200 transition-colors hover:border-white hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Encyclopédie
          </Link>
        </div>
      </div>
    </div>
  );
}
