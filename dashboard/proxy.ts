import { NextRequest, NextResponse } from "next/server";

// Single shared-secret gate for this internal admin dashboard (it can delete cards
// and trigger posting jobs, so it shouldn't be left open). Swap for real auth if this
// ever needs per-user accounts.
export function proxy(req: NextRequest) {
  const authed = req.cookies.get("ss_auth")?.value === "abcd1234";
  if (authed) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
