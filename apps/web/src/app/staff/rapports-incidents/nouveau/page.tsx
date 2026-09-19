import { IncidentReportEditor } from "@/components/staff/IncidentReportEditor";

export const metadata = { title: "Nouveau rapport d'incident — Staff" };

export default function NouveauIncidentReportPage() {
  return <IncidentReportEditor mode="create" />;
}
