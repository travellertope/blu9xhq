import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must match authOptions.cookies.sessionToken.name in lib/auth.ts exactly.
// Relying on NextAuth's secure-cookie-name heuristic instead let the cookie
// name drift between the Node API route and the Edge middleware, which
// silently bounced freshly-signed-in users back to /login.
const SESSION_COOKIE_NAME = "__Secure-next-auth.session-token";

const REF_CODE_RE = /^[A-Z0-9]{4,20}$/i;
const REF_TTL_SECONDS = 60 * 60 * 24 * 60; // 60 days

const authMiddleware = withAuth({
  pages: { signIn: "/login" },
  cookies: { sessionToken: { name: SESSION_COOKIE_NAME } },
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ref = req.nextUrl.searchParams.get("ref");
  const shouldSetRef = !!(ref && REF_CODE_RE.test(ref) && !req.cookies.get("bluu_ref"));

  if (pathname.startsWith("/dashboard")) {
    // Auth is required; let withAuth handle the redirect.
    const authRes = (authMiddleware as any)(req) as NextResponse;
    if (shouldSetRef && authRes?.cookies) {
      try {
        authRes.cookies.set("bluu_ref", ref!.toUpperCase(), {
          maxAge: REF_TTL_SECONDS, path: "/", sameSite: "lax", httpOnly: false,
        });
      } catch { /* redirect responses may not accept cookie mutations */ }
    }
    return authRes ?? NextResponse.next();
  }

  // Non-protected routes: just set ref cookie if present and continue.
  if (shouldSetRef) {
    const res = NextResponse.next();
    res.cookies.set("bluu_ref", ref!.toUpperCase(), {
      maxAge: REF_TTL_SECONDS, path: "/", sameSite: "lax", httpOnly: false,
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png).*)",
  ],
};
