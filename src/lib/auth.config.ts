import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — NO Prisma/Node.js native modules.
 * Used by middleware for route protection.
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPrefixes = ["/dashboard", "/service-request", "/contact", "/user-management", "/settings", "/account", "/forbidden"];
      const isProtected = protectedPrefixes.some((p) => nextUrl.pathname.startsWith(p));
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
};
