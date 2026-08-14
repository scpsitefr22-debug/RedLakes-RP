import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RouteChrome } from "@/components/layout/RouteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "REDLAKES RP — Encyclopédie SCP Officielle",
    template: "%s | REDLAKES RP",
  },
  description:
    "Site officiel de REDLAKES RP. Encyclopédie immersive SCP / DarkRP : wiki, factions, lore, carte interactive, Site-12 et A.E.G.I.S.",
  keywords: ["SCP", "DarkRP", "REDLAKES", "Roleplay", "Minecraft", "Site-12", "AEGIS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="scanlines crt-noise min-h-full flex flex-col bg-background text-foreground">
        <RouteChrome>{children}</RouteChrome>
      </body>
    </html>
  );
}
