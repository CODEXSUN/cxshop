import { NextResponse } from "next/server";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const cookieName = process.env.LOGIN_COOKIE_NAME;
  if (!cookieName) throw new Error("LOGIN_COOKIE_NAME is required");
  response.cookies.delete(cookieName);
  return response;
}
