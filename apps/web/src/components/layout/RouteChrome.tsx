"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { IntegrationReturnBanner } from "@/components/integration/IntegrationReturnBanner";

export function RouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConsole = pathname?.startsWith("/console");
  // REDLAKES CORE se présente comme un vrai OS plein écran une fois connecté
  // — pas une page dans le chrome habituel du site (même logique que /console).
  const isCore = pathname?.startsWith("/core");
  const hideChrome = isConsole || isCore;

  return (
    <>
      {!hideChrome && <Header />}
      <main className={hideChrome ? "" : "flex-1"}>{children}</main>
      {!hideChrome && <Footer />}
      <IntegrationReturnBanner />
    </>
  );
}
