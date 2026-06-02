import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard", "/service-request/:path*", "/contact/:path*", "/user-management/:path*", "/settings/:path*", "/account/:path*", "/forbidden"],
};
