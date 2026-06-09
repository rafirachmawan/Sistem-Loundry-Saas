import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati static files, favicon, API auth, dan halaman register
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/api/auth" ||
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
        if (payload.role === "OWNER") {
          return NextResponse.redirect(new URL("/owner/dashboard", request.url));
        } else if (payload.role === "KASIR") {
          return NextResponse.redirect(new URL("/kasir", request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Rute terproteksi
  const isOwnerRoute = pathname.startsWith("/owner");
  const isKasirRoute = pathname.startsWith("/kasir");
  const isApiRoute = pathname.startsWith("/api");

  if (isOwnerRoute || isKasirRoute || isApiRoute) {
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
    if (isOwnerRoute && payload.role !== "OWNER") {
      // Kasir tidak boleh masuk halaman Owner, lempar ke halaman Kasir
      return NextResponse.redirect(new URL("/kasir", request.url));
    }

    // Owner diperbolehkan masuk ke halaman Kasir (sesuai PRD: Seluruh hak akses Kasir dimiliki Owner)

    // Inject data user terotentikasi ke request headers agar API Route bisa langsung membacanya
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-tenant-id", payload.tenantId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/kasir/:path*", "/api/:path*", "/login"],
};
