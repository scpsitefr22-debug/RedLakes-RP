"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function RouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConsole = pathname?.startsWith("/console");

  return (
    <>
      {!isConsole && <Header />}
      <main className={isConsole ? "" : "flex-1"}>{children}</main>
      {!isConsole && <Footer />}
    </>
  );
}
