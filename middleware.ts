import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "aiqa_guest_session";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const hasGuestCookie = req.cookies.has(COOKIE_NAME);
  if (!hasGuestCookie) {
    res.cookies.set(COOKIE_NAME, `guest_${crypto.randomUUID()}`, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production"
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
