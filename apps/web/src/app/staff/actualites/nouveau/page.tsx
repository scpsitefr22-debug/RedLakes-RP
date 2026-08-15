import { NewsEditor } from "@/components/staff/NewsEditor";

export const metadata = { title: "Nouvel article — Staff" };

export default function NouvelArticlePage() {
  return <NewsEditor mode="create" />;
}
