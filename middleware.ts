import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const path = req.nextUrl.pathname;

  if (!token) {
    if (path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  if (path === "/login") {
    const redirectTo =
      role === "supervisor"
        ? "/supervisor/dashboard"
        : role === "trainee"
        ? "/trainee/courses"
        : role === "admin"
        ? "/admin/dashboard"
        : "/";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  const rolePaths: Record<string, string> = {
    trainee: "/trainee",
    supervisor: "/supervisor",
    admin: "/admin",
  };

  if (role && !path.startsWith(rolePaths[role])) {
    const redirectTo =
      role === "supervisor"
        ? "/supervisor/dashboard"
        : role === "trainee"
        ? "/trainee/courses"
        : role === "admin"
        ? "/admin/dashboard"
        : "/";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/trainee/:path*",
    "/supervisor/:path*",
    "/admin/:path*",
  ],
};
