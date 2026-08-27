import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canActivacionVentasAccessPath, isActivacionVentas } from "@/lib/access-control";
import { db } from "@/lib/db";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true, banned: true },
  });

  if (!currentUser || currentUser.status !== "ACTIVE" || currentUser.banned === true) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isActivacionVentas(currentUser.role) && !canActivacionVentasAccessPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard-comercial/:path*",
    "/nexus-score/:path*",
    "/prospectos/:path*",
    "/clients/:path*",
    "/clientes/:path*",
    "/tramites/:path*",
    "/visa-china/:path*",
    "/citas/:path*",
    "/servicios/:path*",
    "/administration/:path*",
    "/settings/:path*",
    "/whatsapp-onboarding/:path*",
  ],
};
