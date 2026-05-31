import NextAuth from "next-auth";
import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** NextAuth gate role — "bluu_admin" | "bluu_client" */
      role?: string;
      /** WP user database ID */
      wpUserId?: number;
      /** bluu_client CPT post ID (portal users only) */
      clientId?: string;
      /** CRM permission level — super_admin | account_manager | billing_manager | support_staff | viewer */
      bluuhqRole?: string;
      /** Client post IDs assigned to this account_manager */
      assignedClients?: number[];
      /** "active" | "deactivated" */
      status?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string;
    wpUserId?: number;
    clientId?: string;
    bluuhqRole?: string;
    assignedClients?: number[];
    status?: string;
  }
}
