import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // ambil cookie session dari Laravel (cookie-based Sanctum)
  const laravelSession = req.cookies.get("laravel_session")?.value;

  // kalau akses /dashboard* tapi belum ada session cookie -> redirect langsung
  if (pathname.startsWith("/dashboard") && !laravelSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname); // optional: biar bisa balik lagi
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// limit middleware hanya jalan di route tertentu
export const config = {
  matcher: ["/dashboard/:path*"],
};
