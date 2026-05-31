import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import type { UserRole } from "@/types";

const WORDPRESS_URL = process.env.WORDPRESS_URL!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

// ─── WP REST API user validation ──────────────────────────────────────────────

interface WPUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  meta: { bluu_client_post_id?: string };
}

async function validateWPCredentials(
  username: string,
  password: string
): Promise<WPUser | null> {
  try {
    const res = await fetch(`${WORDPRESS_URL}/wp-json/bluuhq/v1/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── NextAuth config ──────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 hours

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    // ── Admin login (WP username + password, role = bluu_admin) ────────────
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null;
        const user = await validateWPCredentials(
          credentials.username,
          credentials.password
        );
        if (!user || !user.roles.includes("bluu_admin")) return null;
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: "bluu_admin" as UserRole,
          wpUserId: user.id,
        };
      },
    }),

    // ── Client login (WP username + password, role = bluu_client) ──────────
    CredentialsProvider({
      id: "client-credentials",
      name: "Client Login",
      credentials: {
        username: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null;
        const user = await validateWPCredentials(
          credentials.username,
          credentials.password
        );
        if (!user || !user.roles.includes("bluu_client")) return null;
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: "bluu_client" as UserRole,
          wpUserId: user.id,
          clientId: user.meta?.bluu_client_post_id,
        };
      },
    }),

    // ── Magic link — client portal invite flow (sent via Resend) ───────────
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.wpUserId = (user as any).wpUserId;
        token.clientId = (user as any).clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).wpUserId = token.wpUserId;
        (session.user as any).clientId = token.clientId;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};
