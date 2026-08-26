import { Suspense } from "react";
import { BienvenueTerminal } from "@/components/auth/BienvenueTerminal";

export const metadata = {
  title: "Bienvenue — REDLAKES",
  description: "Création de votre personnage REDLAKES",
};

export default function BienvenuePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center font-mono text-gray-500">
          Chargement...
        </div>
      }
    >
      <BienvenueTerminal />
    </Suspense>
  );
}
