import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { consumeMagicToken, ensureUser } from "./redis";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    // One-time emailed token, no password — scan-tool users are leads
    // identified only by the email they gave at the report gate.
    CredentialsProvider({
      id: "magic-link",
      name: "Magic Link",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) return null;

        const verifiedEmail = await consumeMagicToken(credentials.token);
        if (!verifiedEmail || verifiedEmail !== credentials.email) return null;

        await ensureUser(verifiedEmail);

        return { id: verifiedEmail, email: verifiedEmail };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
