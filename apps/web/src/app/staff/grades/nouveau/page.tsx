import { GradeEditor } from "@/components/staff/GradeEditor";

export const metadata = { title: "Nouveau grade — Staff" };

export default function NouveauGradePage() {
  return <GradeEditor mode="create" />;
}
