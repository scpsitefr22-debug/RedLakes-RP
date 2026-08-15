import { GameEventEditor } from "@/components/staff/GameEventEditor";

export const metadata = { title: "Nouvel événement — Staff" };

export default function NouvelEvenementPage() {
  return <GameEventEditor mode="create" />;
}
