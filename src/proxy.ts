import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati static files, favicon, API auth, dan halaman register
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  // Ambil token dari cookie
  const token = request.cookies.get("auth_token")?.value;

  // Jika mengakses halaman login atau register
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        if (payload.role === "DEVELOPER") {
          return NextResponse.redirect(new URL("/developer/dashboard", request.url));
        } else if (payload.role === "OWNER") {
          return NextResponse.redirect(new URL("/owner/dashboard", request.url));
        } else if (payload.role === "KASIR") {
          return NextResponse.redirect(new URL("/kasir", request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Rute terproteksi
  const isDeveloperRoute = pathname.startsWith("/developer");
  const isOwnerRoute = pathname.startsWith("/owner");
  const isKasirRoute = pathname.startsWith("/kasir");
  const isApiRoute = pathname.startsWith("/api");

  if (isDeveloperRoute || isOwnerRoute || isKasirRoute || isApiRoute) {
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json(
          { success: false, message: "Autentikasi diperlukan" },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      if (isApiRoute) {
        return NextResponse.json(
          { success: false, message: "Sesi tidak valid atau kedaluwarsa" },
          { status: 401 }
        );
      }
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }

    // Validasi Peran (Role Authorization)
    if (isDeveloperRoute && payload.role !== "DEVELOPER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isOwnerRoute && payload.role !== "OWNER") {
      // Kasir/Developer tidak boleh masuk halaman Owner (kecuali jika role-nya disesuaikan)
      if (payload.role === "DEVELOPER") {
        return NextResponse.redirect(new URL("/developer/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/kasir", request.url));
    }

    // Inject data user terotentikasi ke request headers agar API Route bisa langsung membacanya
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-tenant-id", payload.tenantId);
    if (payload.branchId) {
      requestHeaders.set("x-branch-id", payload.branchId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/developer/:path*", "/owner/:path*", "/kasir/:path*", "/api/:path*", "/login"],
};
