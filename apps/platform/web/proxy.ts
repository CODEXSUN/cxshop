import { NextRequest, NextResponse } from "next/server";

const protectedDesks = [
  { prefix: "/vendor", portal: "vendor", login: "/vendor/login" },
  { prefix: "/admin", portal: "admin", login: "/admin/login" },
  { prefix: "/sa", portal: "sa", login: "/sa/login" },
  { prefix: "/account", portal: "store", login: "/login" }
] as const;

export async function proxy(request: NextRequest) {
  const desk = protectedDesks.find(item => request.nextUrl.pathname === item.prefix || request.nextUrl.pathname.startsWith(`${item.prefix}/`));
  if (!desk || request.nextUrl.pathname === desk.login) return NextResponse.next();
  const apiOrigin = process.env.API_URL;
  if (!apiOrigin) throw new Error("API_URL is required");
  const response = await fetch(`${apiOrigin}/v1/auth/session?portal=${desk.portal}`, { headers: { cookie: request.headers.get("cookie") ?? "" }, cache: "no-store" }).catch(() => undefined);
  if (response?.ok) return NextResponse.next();
  const login = new URL(desk.login, request.url);
  if (response?.status === 401) login.searchParams.set("reason", "session-expired");
  if (response?.status === 403) login.searchParams.set("reason", "portal-switch");
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/account/:path*", "/vendor/:path*", "/admin/:path*", "/sa/:path*"] };
