import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes only accessible when NOT logged in
const PUBLIC_ONLY_ROUTES = ["/login", "/sign-up", "/forgot-password", "/reset-password"];

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const isAuthed = Boolean(accessToken);

  // Logged-in user hitting a public-only route → redirect to dashboard
  if (isAuthed && PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard/projects", request.url));
  }

  // Unauthenticated user hitting a protected route → redirect to login
  if (!isAuthed && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};