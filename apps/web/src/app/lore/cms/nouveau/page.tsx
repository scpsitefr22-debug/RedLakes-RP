import { LoreEditor } from "@/components/lore/LoreEditor";

export const metadata = { title: "Nouvel article — CMS Lore" };

export default function NouveauLorePage() {
  return <LoreEditor mode="create" />;
}
