import type { Metadata } from "next";

// La page est un composant client : son titre d'onglet est déclaré ici.
export const metadata: Metadata = { title: "Tableau de bord" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
