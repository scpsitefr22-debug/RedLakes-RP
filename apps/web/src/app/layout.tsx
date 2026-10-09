import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { RouteChrome } from "@/components/layout/RouteChrome";

// Signalétique condensée pour les titres, Plex (la typo des documents
// techniques) pour le texte et les données : un site qui se lit comme les
// archives internes d'un site de confinement.
const signage = Barlow_Condensed({
  variable: "--font-signage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const code = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${signage.variable} ${body.variable} ${code.variable} h-full antialiased`}
    >
      <body className="scanlines crt-noise min-h-full flex flex-col bg-background text-foreground">
        <RouteChrome>{children}</RouteChrome>
      </body>
    </html>
  );
}
