// src/app/(system)/dashboard/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardAccesosComerciales } from "@/components/system/dashboard/dashboard-accesos-comerciales";
import { DashboardBienvenida } from "@/components/system/dashboard/dashboard-bienvenida";
import { DashboardContainer } from "@/components/system/dashboard/dashboard-container";
import { DashboardProspectosMetricas } from "@/components/system/dashboard/dashboard-prospectos-metricas";
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
    return (
      <div className="flex-1">
        <DashboardAccesosComerciales />
        <DashboardProspectosMetricas />
        <DashboardContainer nombreUsuario={session.user.name} rol={rol} />
      </div>
    );
  }

  return <DashboardBienvenida nombre={session.user.name} rol={rol} />;
}
