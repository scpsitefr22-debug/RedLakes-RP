import { StaffDashboard } from "@/components/staff/StaffDashboard";

export const metadata = { title: "Tableau de bord Staff" };

export default function StaffPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs tracking-widest text-redlake-glow">
          ADMINISTRATION SITE-12
        </p>
        <h1 className="text-4xl font-bold text-white">Tableau de bord Staff</h1>
        <p className="mt-4 text-gray-500">
          Candidatures, rapports RP déposés par le personnel et gestion du registre.
          Accès restreint au personnel autorisé.
        </p>
      </div>

      <StaffDashboard />
    </div>
  );
}
