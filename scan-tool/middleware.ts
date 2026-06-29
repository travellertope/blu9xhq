import { withAuth } from "next-auth/middleware";

// Kept as a literal (not imported from lib/auth) because middleware runs
// in the Edge runtime, and lib/auth.ts transitively imports lib/redis.ts,
// which uses Node's `crypto` module — not available at the Edge.
// Must match authOptions.cookies.sessionToken.name in lib/auth.ts exactly.
// Relying on NextAuth's secure-cookie-name heuristic instead let the cookie
// name drift between the Node API route and the Edge middleware, which
// silently bounced freshly-signed-in users back to /login.
const SESSION_COOKIE_NAME = "__Secure-next-auth.session-token";

export default withAuth({
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
