import type { Metadata } from "next";

// La page est un composant client : son titre d'onglet est déclaré ici.
// « absolute » : le titre parent (Grades — Staff) coupe le suffixe du site.
export const metadata: Metadata = { title: { absolute: "Grades & accès | REDLAKES RP" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
