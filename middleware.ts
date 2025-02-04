import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login";

  console.log("=== Middleware Debug ===");
  console.log("Path:", path);
  console.log("Cookie Header:", request.headers.get("cookie"));
  console.log("All Cookies:", request.cookies.getAll());
  console.log("Specific Cookie:", request.cookies.get("fetch-access-token"));
  console.log("All Headers:", Object.fromEntries(request.headers.entries()));
  console.log("URL:", request.url);

  const authCookie = request.cookies.get("fetch-access-token")?.value;
  const isAuthenticated = !!authCookie;

  console.log("Is Authenticated:", isAuthenticated);
  console.log("=====================");

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
