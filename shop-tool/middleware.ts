import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/** Looks up a shop's slug by its custom domain (Starter/Pro only). Runs
 *  against Supabase's REST API directly since middleware can't use the
 *  cookie-bound server client for an unauthenticated, cross-shop query. */
async function resolveShopSlugForDomain(host: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/shops?custom_domain=eq.${encodeURIComponent(host)}&active=eq.true&select=slug&limit=1`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { slug: string }[];
    return rows[0]?.slug ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Custom domain routing (Starter/Pro) ─────────────────────────────────────
  // A merchant's own domain should show their storefront at "/", not "/slug".
  // Only rewrite for hosts that aren't shop.bluuhq.com itself.
  const appHost = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/^https?:\/\//, "").replace(/:\d+$/, "");
  const host = (req.headers.get("host") ?? "").replace(/:\d+$/, "");
  if (appHost && host && host !== appHost) {
    const slug = await resolveShopSlugForDomain(host);
    if (slug) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === "/" ? `/${slug}` : `/${slug}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  // Refresh session — sets updated cookies on `res` if needed
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if ((pathname === "/dashboard" || pathname.startsWith("/dashboard/")) && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin-email check happens in lib/admin.ts (requireAdmin) — this is just
  // the "must be signed in at all" gate, same pattern as /dashboard above.
  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)",
  ],
};
