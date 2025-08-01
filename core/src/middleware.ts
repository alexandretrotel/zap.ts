import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { $fetch } from "@/lib/fetch";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import type { Session } from "@/zap/lib/auth/client";

const LOGIN_URL = ZAP_DEFAULT_SETTINGS.AUTH.LOGIN_URL;

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Redirect to waitlist if feature is enabled and user is not on waitlist page
    if (
      ZAP_DEFAULT_SETTINGS.WAITLIST.ENABLE_WAITLIST_PAGE &&
      pathname !== "/waitlist"
    ) {
      const waitlistUrl = new URL("/waitlist", request.url);
      return NextResponse.redirect(waitlistUrl);
    }

    // Allow public paths
    if (
      ZAP_DEFAULT_SETTINGS.AUTH.PUBLIC_PATHS.includes(pathname) ||
      pathname.startsWith(ZAP_DEFAULT_SETTINGS.BLOG.BASE_PATH)
    ) {
      const requestHeaders = new Headers(request.headers);

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      return response;
    }

    // Fetch session from API
    let session: Session | null = null;
    try {
      session = await $fetch<Session>("/api/auth/get-session", {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });
    } catch {
      // Session fetch failed, treat as unauthenticated
      session = null;
    }

    if (!session) {
      // Redirect unauthenticated users to /login with the original path as a query param
      const loginUrl = new URL(LOGIN_URL, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Add session and security headers for authenticated requests
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-session", JSON.stringify(session));

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    return response;
  } catch {
    // Fallback: redirect to login on any unexpected error
    const loginUrl = new URL(LOGIN_URL, request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    {
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico, sitemap.xml, robots.txt (metadata files)
       * - sw.js (service worker)
       * - manifest.json, manifest.ts, manifest.webmanifest (PWA manifest files)
       * - icon-192x192.png, icon-512x512.png (PWA icons)
       * - /_vercel/.* (Vercel specific files)
       * - badge.png, favicon-16x16.png, favicon-32x32.png (favicon files)
       * - og.png (Open Graph image)
       * - opengraph-image (OpenGraph image route)
       */
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|sitemap-0.xml|robots.txt|sw.js|manifest.json|manifest.webmanifest|icon-192x192.png|icon-512x512.png|apple-touch-icon.png|badge.png|favicon-16x16.png|favicon-32x32.png|og.png|opengraph-image.*|_vercel/.*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
