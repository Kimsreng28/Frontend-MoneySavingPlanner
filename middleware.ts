import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/signup"];
const publicRoutes = ["/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  console.log("Middleware:", {
    pathname,
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    isProtectedRoute: protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ),
    isAuthRoute: authRoutes.includes(pathname),
  });

  // Skip middleware for API routes and avatar endpoints
  if (pathname.startsWith("/api/") || pathname.startsWith("/users/avatar/")) {
    console.log("Middleware: Skipping middleware for", pathname);
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect root to dashboard if logged in, else to login
  if (pathname === "/") {
    console.log("Middleware: Root path, token exists:", !!token);
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If trying to access protected route without token
  if (isProtectedRoute && !token) {
    console.log("Middleware: Blocking protected route without token");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and trying to access auth routes
  if (isAuthRoute && token) {
    console.log("Middleware: Redirecting from auth route to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
