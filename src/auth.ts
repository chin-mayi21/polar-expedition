import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isUserRole } from "@/lib/auth/role-entry";
import { authConfig } from "@/auth.config";
import { clearOAuthRoleCookie, readOAuthRoleCookie } from "@/lib/auth/oauth-role-cookie";
import type { UserRole } from "@prisma/client";

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRole: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const expectedRole =
          typeof credentials?.expectedRole === "string" && isUserRole(credentials.expectedRole)
            ? credentials.expectedRole
            : null;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (expectedRole && user.role !== expectedRole) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const email = profile?.email?.toLowerCase();
      if (!email) return false;

      const pendingRole = await readOAuthRoleCookie();
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        if (!pendingRole) {
          return "/login?error=OAuthRoleRequired";
        }
        try {
          const { registerUser } = await import("@/lib/auth/register-user");
          user = await registerUser({
            email,
            name: profile.name ?? email,
            role: pendingRole,
            googleId: account.providerAccountId,
          });
        } catch {
          return "/login?error=OAuthSignupFailed";
        }
      } else if (pendingRole && user.role !== pendingRole) {
        return "/login?error=RoleMismatch";
      }

      if (user && account.providerAccountId && !user.googleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleId: account.providerAccountId },
        });
      }

      await clearOAuthRoleCookie();
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user && "role" in user && user.role) {
        token.sub = user.id;
        token.role = user.role as UserRole;
        return token;
      }

      if (account?.provider === "google" && profile?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: profile.email.toLowerCase() },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!user.id) return;
      try {
        await prisma.auditEvent.create({
          data: {
            actorUserId: user.id,
            entityType: "User",
            entityId: user.id,
            action: "LOGIN",
            metadata: JSON.stringify({ provider: account?.provider ?? "credentials" }),
          },
        });
      } catch (e) {
        console.error("[auth] audit log failed", e);
      }
    },
  },
});
