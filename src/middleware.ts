import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/signup") ||
    pathname === "/design-preview" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/register" ||
    pathname.startsWith("/api/oauth");

  if (isPublic) {
    return NextResponse.next();
  }

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const role = session.user.role;

  if (pathname.startsWith("/hq") && role !== "OPERATIONS_OFFICIAL") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/field") && role !== "FIELD_PERSONNEL") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/family") && role !== "FAMILY_NOK") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
