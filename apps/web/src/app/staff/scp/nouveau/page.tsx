import { ScpEditor } from "@/components/staff/ScpEditor";

export const metadata = { title: "Nouvel objet SCP — Staff" };

export default function NouvelScpPage() {
  return <ScpEditor mode="create" />;
}
