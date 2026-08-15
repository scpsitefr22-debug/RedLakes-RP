import { CharacterEditor } from "@/components/staff/CharacterEditor";

export const metadata = { title: "Nouveau personnage — Staff" };

export default function NouveauPersonnagePage() {
  return <CharacterEditor mode="create" />;
}
