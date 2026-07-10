import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Affiliate referral cookie ────────────────────────────────────────────────
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref && !req.cookies.get("bluu_ref") && /^[A-Z0-9]{4,20}$/i.test(ref)) {
    const res = NextResponse.next();
    res.cookies.set("bluu_ref", ref.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 60,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
    return res;
  }

  // ── Subdomain / tenant detection ─────────────────────────────────────────────
  // Injects x-tenant-slug so server components can brand by tenant without a
  // DB round-trip (the JWT already carries tenant_id for RLS enforcement).
  const host      = req.headers.get("host") ?? "";
  const crmDomain = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "").replace(/:\d+$/, "");
  let tenantSlug: string | null = null;
  if (crmDomain && host !== crmDomain && host.endsWith("." + crmDomain)) {
    tenantSlug = host.slice(0, host.length - crmDomain.length - 1);
  }

  // ── Build a response object that the Supabase client can write cookies to ───
  const requestHeaders = new Headers(req.headers);
  if (tenantSlug) requestHeaders.set("x-tenant-slug", tenantSlug);
  let res = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — sets updated cookies on `res` if needed
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Derive role from custom JWT claims (injected by the access token hook)
  const claims = session?.user?.app_metadata ?? {};
  const userType: string = claims.user_type ?? "";
  const role =
    userType === "team"      ? "bluu_admin"
    : userType === "client"  ? "bluu_client"
    : userType === "affiliate" ? "bluu_affiliate"
    : null;

  // ── Admin routes ─────────────────────────────────────────────────────────────
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) return NextResponse.redirect(new URL("/admin-login", req.url));
    if (role !== "bluu_admin") {
      if (role === "bluu_client")    return NextResponse.redirect(new URL("/portal", req.url));
      if (role === "bluu_affiliate") return NextResponse.redirect(new URL("/affiliate", req.url));
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
  }

  // ── Client portal routes ──────────────────────────────────────────────────────
  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    if (pathname === "/portal/verify") return res;
    if (!session) return NextResponse.redirect(new URL("/portal-login", req.url));
    if (role !== "bluu_client") {
      if (role === "bluu_admin")     return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "bluu_affiliate") return NextResponse.redirect(new URL("/affiliate", req.url));
      return NextResponse.redirect(new URL("/portal-login", req.url));
    }
  }

  // ── Affiliate routes ──────────────────────────────────────────────────────────
  if (pathname === "/affiliate" || pathname.startsWith("/affiliate/")) {
    if (!session) return NextResponse.redirect(new URL("/affiliate-login", req.url));
    if (role !== "bluu_affiliate") {
      if (role === "bluu_admin")  return NextResponse.redirect(new URL("/admin", req.url));
      if (role === "bluu_client") return NextResponse.redirect(new URL("/portal", req.url));
      return NextResponse.redirect(new URL("/affiliate-login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/affiliate/:path*",
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png).*)",
  ],
};
