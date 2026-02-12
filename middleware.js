import { NextResponse } from "next/server";

export function middleware(req) {
  const { nextUrl } = req;

  const auth = req.cookies.get("auth")?.value;

  if (!auth) {
    const url = nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
