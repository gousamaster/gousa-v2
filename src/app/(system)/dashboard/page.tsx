// src/app/(system)/dashboard/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardBienvenida } from "@/components/system/dashboard/dashboard-bienvenida";
import { DashboardContainer } from "@/components/system/dashboard/dashboard-container";
import { auth } from "@/lib/auth";

const ROLES_GERENCIALES = ["MANAGER", "ADMIN", "SUPER_ADMIN"] as const;

type RolGerencial = (typeof ROLES_GERENCIALES)[number];

function esRolGerencial(rol: string): rol is RolGerencial {
  return ROLES_GERENCIALES.includes(rol as RolGerencial);
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const rol = session.user.role ?? "USER";

  if (esRolGerencial(rol)) {
    return <DashboardContainer nombreUsuario={session.user.name} rol={rol} />;
  }

  return <DashboardBienvenida nombre={session.user.name} rol={rol} />;
}
