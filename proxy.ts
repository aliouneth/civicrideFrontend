import { NextResponse, type NextRequest } from "next/server";

// Coarse gate: token cookie must exist for app segments. Fine-grained role
// checks happen in server layouts via GET /auth/me (cookie can't be trusted
// for roles — it only proves "logged in somewhere").
export function proxy(request: NextRequest) {
  const token = request.cookies.get("cr_token")?.value;
  const { pathname } = request.nextUrl;

  // Root entry: logged-in users go to the board (role routing happens in
  // layouts), everyone else to login. Edge redirect = no flash, no meta refresh.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/dashboard" : "/login", request.url));
  }

  const isAppRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/rides")
    || pathname.startsWith("/drivers") || pathname.startsWith("/reports")
    || pathname.startsWith("/driver") || pathname.startsWith("/platform/dashboard")
    || pathname.startsWith("/agency-users") || pathname.startsWith("/agency-dashboard")
    || pathname.startsWith("/team");

  if (isAppRoute && !token) {
    const loginPath = pathname.startsWith("/platform") ? "/platform/login" : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons).*)"],
};
