import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";
import { isUserRole } from "@/lib/auth/role-entry";

export const OAUTH_ROLE_COOKIE = "cryolink_oauth_role";

export async function setOAuthRoleCookie(role: UserRole) {
  const jar = await cookies();
  jar.set(OAUTH_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
}

export async function readOAuthRoleCookie(): Promise<UserRole | null> {
  const jar = await cookies();
  const value = jar.get(OAUTH_ROLE_COOKIE)?.value;
  if (!value || !isUserRole(value)) return null;
  return value;
}

export async function clearOAuthRoleCookie() {
  const jar = await cookies();
  jar.delete(OAUTH_ROLE_COOKIE);
}
