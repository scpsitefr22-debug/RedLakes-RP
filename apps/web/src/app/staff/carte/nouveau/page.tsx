import { MapLocationEditor } from "@/components/staff/MapLocationEditor";

export const metadata = { title: "Nouvel emplacement — Staff" };

export default function NouvelEmplacementPage() {
  return <MapLocationEditor mode="create" />;
}
