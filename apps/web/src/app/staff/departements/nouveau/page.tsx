import { DepartmentEditor } from "@/components/staff/DepartmentEditor";

export const metadata = { title: "Nouveau département — Staff" };

export default function NouveauDepartementPage() {
  return <DepartmentEditor mode="create" />;
}
