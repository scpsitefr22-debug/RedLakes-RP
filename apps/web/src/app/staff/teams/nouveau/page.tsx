import { TeamEditor } from "@/components/staff/TeamEditor";

export const metadata = { title: "Nouvelle équipe — Staff" };

export default function NouvelleTeamPage() {
  return <TeamEditor mode="create" />;
}
