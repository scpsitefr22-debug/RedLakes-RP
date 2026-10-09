import { StaffDashboard } from "@/components/staff/StaffDashboard";

export const metadata = { title: "Tableau de bord Staff" };

export default function StaffPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="label-mono mb-3 flex items-center gap-2 text-redlake-glow">
          <span className="h-px w-8 bg-redlake-glow" aria-hidden />
          Administration Site-12
        </p>
        <h1 className="font-display text-5xl font-extrabold text-white">Tableau de bord staff</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          Candidatures, rapports RP déposés par le personnel et gestion du registre.
          Accès restreint au personnel autorisé.
        </p>
      </div>

      <StaffDashboard />
    </div>
  );
}
