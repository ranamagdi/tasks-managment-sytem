import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes only accessible when NOT logged in
const PUBLIC_ONLY_ROUTES = [
  "/login",
  "/sign-up",
  "/forgot-password",
];

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;

  const isAuthed = Boolean(accessToken);

  // Logged-in user hitting a public-only route
  if (
    isAuthed &&
    PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    return NextResponse.redirect(
      new URL("/dashboard/projects", request.url)
    );
  }

  // Unauthenticated user hitting protected route
  if (
    !isAuthed &&
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};