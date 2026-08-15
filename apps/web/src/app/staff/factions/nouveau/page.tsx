import { FactionEditor } from "@/components/staff/FactionEditor";

export const metadata = { title: "Nouvelle faction — Staff" };

export default function NouvelleFactionPage() {
  return <FactionEditor mode="create" />;
}
