import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Affiliate referral cookie ────────────────────────────────────────────────
  // Set on any page load with ?ref=CODE so attribution works across all Bluu
  // properties. First-touch wins — we never overwrite an existing cookie.
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref && !req.cookies.get("bluu_ref") && /^[A-Z0-9]{4,20}$/i.test(ref)) {
    const res = NextResponse.next();
    res.cookies.set("bluu_ref", ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
    return res;
  }

  const token = await getToken({ req, secret });

  // ── Admin routes ────────────────────────────────────────────────────────────
  // Use === "/admin" || startsWith("/admin/") so /admin-login never matches.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!token) return NextResponse.redirect(new URL("/admin-login", req.url));
    const role = (token as any).role;
    if (role !== "bluu_admin") {
      if (role === "bluu_client")    return NextResponse.redirect(new URL("/portal", req.url));
      if (role === "bluu_affiliate") return NextResponse.redirect(new URL("/affiliate", req.url));
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
  }

  // ── Client portal routes ────────────────────────────────────────────────────
  // Use === "/portal" || startsWith("/portal/") so /portal-login never matches.
  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    // /portal/verify must be reachable without a session (magic-link landing)
    if (pathname === "/portal/verify") return NextResponse.next();
    if (!token) return NextResponse.redirect(new URL("/portal-login", req.url));
    const role = (token as any).role;
    if (role !== "bluu_client") {
      if (role === "bluu_admin")     return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "bluu_affiliate") return NextResponse.redirect(new URL("/affiliate", req.url));
      return NextResponse.redirect(new URL("/portal-login", req.url));
    }
  }

  // ── Affiliate routes ────────────────────────────────────────────────────────
  // Use === "/affiliate" || startsWith("/affiliate/") so /affiliate-login and
  // /affiliate-register never match.
  if (pathname === "/affiliate" || pathname.startsWith("/affiliate/")) {
    if (!token) return NextResponse.redirect(new URL("/affiliate-login", req.url));
    const role = (token as any).role;
    if (role !== "bluu_affiliate") {
      if (role === "bluu_admin")  return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "bluu_client") return NextResponse.redirect(new URL("/portal", req.url));
      return NextResponse.redirect(new URL("/affiliate-login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/affiliate/:path*",
    // Broad matcher for the ref cookie — excludes Next.js internals and static assets
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png).*)",
  ],
};
