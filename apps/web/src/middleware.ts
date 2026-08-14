import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/intranet",
  "/dashboard",
  "/staff",
  "/lore/cms",
  "/archives",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!needsAuth) return NextResponse.next();

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
    "/intranet/:path*",
    "/dashboard/:path*",
    "/staff/:path*",
    "/lore/cms/:path*",
    "/archives/:path*",
  ],
};
