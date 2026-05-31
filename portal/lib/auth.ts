import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { UserRole } from "@/types";

const WORDPRESS_URL = process.env.WORDPRESS_URL!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

// ─── WP credential validation ─────────────────────────────────────────────────

interface WPUserMeta {
  bluu_client_post_id?: string | null;
  bluuhq_role?: string;
  bluuhq_assigned_clients?: number[];
  bluuhq_status?: string;
}

interface WPUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  meta: WPUserMeta;
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
    signIn: "/portal-login",
    error: "/auth-error",
  },

  providers: [
    // ── Admin + Team login ──────────────────────────────────────────────────
    // Accepts users with WP role bluu_admin (owner) OR bluu_team (internal team).
    // The CRM-level permission (bluuhqRole) comes from the bluuhq_role user meta.
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null;

        try {
          const user = await validateWPCredentials(credentials.username, credentials.password);
          if (!user) return null;

          const isAdmin = user.roles.includes("bluu_admin") || user.roles.includes("administrator");
          const isTeam  = user.roles.includes("bluu_team");
          if (!isAdmin && !isTeam) return null;

          if (user.meta?.bluuhq_status === "deactivated") return null;

          const bluuhqRole = user.meta?.bluuhq_role
            ?? (isAdmin ? "super_admin" : "viewer");

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: "bluu_admin" as UserRole,
            wpUserId: user.id,
            bluuhqRole,
            assignedClients: user.meta?.bluuhq_assigned_clients ?? [],
            status: user.meta?.bluuhq_status ?? "active",
          };
        } catch (err) {
          console.error("[admin-authorize] Unexpected error:", err);
          return null;
        }
      },
    }),

    // ── Client portal login ─────────────────────────────────────────────────
    CredentialsProvider({
      id: "client-credentials",
      name: "Client Login",
      credentials: {
        username: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null;
        const user = await validateWPCredentials(credentials.username, credentials.password);
        if (!user || !user.roles.includes("bluu_client")) return null;
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: "bluu_client" as UserRole,
          wpUserId: user.id,
          clientId: user.meta?.bluu_client_post_id ?? undefined,
        };
      },
    }),

  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.role            = u.role;
        token.wpUserId        = u.wpUserId;
        token.clientId        = u.clientId;
        token.bluuhqRole      = u.bluuhqRole;
        token.assignedClients = u.assignedClients;
        token.status          = u.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as any;
        u.id              = token.sub;
        u.role            = token.role;
        u.wpUserId        = token.wpUserId;
        u.clientId        = token.clientId;
        u.bluuhqRole      = token.bluuhqRole;
        u.assignedClients = token.assignedClients;
        u.status          = token.status;
      }
      return session;
    },
  },
};
