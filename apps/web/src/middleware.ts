import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Site verrouille derriere connexion/inscription — strategie de teasing
 * avant l'ouverture du serveur. Le reste (dashboard, carte admin staff,
 * etc.) exige desormais un compte, la ou seules /intranet, /dashboard,
 * /staff, /lore/cms et /archives l'exigeaient auparavant.
 *
 * Exception deliberee : /wiki, /personnages, /factions, /chronologie,
 * /carte et /lore (hors /lore/cms) restent publiques — /integration (le
 * quiz d'onboarding pre-compte, voir IntegrationDossier.tsx) envoie les
 * visiteurs PAS ENCORE inscrits y chercher des indices ; les verrouiller
 * casserait ce parcours pour quiconque n'a pas encore de compte.
 */
const PUBLIC_PATHS = [
  "/",
  "/connexion",
  "/integration",
  "/wiki",
  "/personnages",
  "/factions",
  "/chronologie",
  "/carte",
  "/lore",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /lore/cms reste protege malgre /lore public juste au-dessus.
  if (pathname === "/lore/cms" || pathname.startsWith("/lore/cms/")) {
    return requireAuth(request);
  }

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)),
  );
  if (isPublic) return NextResponse.next();

  return requireAuth(request);
}

function requireAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("redlakes_token");
  if (!token?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf : /api (proxy vers le backend, qui a ses
     * propres gardes — voir next.config.ts), les assets Next.js et les
     * fichiers statiques racine.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
