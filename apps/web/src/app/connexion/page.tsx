import { Suspense } from "react";
import { RpLoginTerminal } from "@/components/auth/RpLoginTerminal";

export const metadata = {
  title: "Connexion — Site-12",
  description: "Terminal d'habilitation REDLAKES RP",
};

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center font-mono text-gray-500">
          Chargement du terminal...
        </div>
      }
    >
      <RpLoginTerminal />
    </Suspense>
  );
}
