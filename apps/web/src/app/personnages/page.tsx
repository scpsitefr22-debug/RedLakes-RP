import { PersonnagesCatalog } from "@/components/personnages/PersonnagesCatalog";

export const metadata = { title: "Personnages importants" };

export default function PersonnagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">Personnages importants</h1>
        <p className="mt-4 text-gray-500">
          Directeurs, inspecteurs, commandants MTF et figures clés — dossiers filtrés
          par habilitation.
        </p>
      </div>
      <PersonnagesCatalog />
    </div>
  );
}
