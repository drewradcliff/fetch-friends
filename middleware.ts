import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login";

  const authCookie = request.cookies.get("fetch-access-token")?.value;
  const isAuthenticated = !!authCookie;

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - static files (/_next/, /images/, etc.)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
  ],
};
