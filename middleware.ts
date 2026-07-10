import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = (req.nextauth.token as any)?.role;

    // Только ADMIN может заходить в /admin
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Закрытая экономика объекта — только бригадир/админ, клиент не должен видеть
    // даже при заходе по прямой ссылке.
    if (pathname.startsWith("/foreman") && role !== "ADMIN" && role !== "FOREMAN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Загрузку отчётов делают FOREMAN и ADMIN
    if (pathname.startsWith("/dashboard/reports/new") && role === "CLIENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/foreman/:path*", "/onboarding"],
};
