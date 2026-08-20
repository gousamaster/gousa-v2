import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardAccesosComerciales } from "@/components/system/dashboard/dashboard-accesos-comerciales";
import { DashboardProspectosEquipo } from "@/components/system/dashboard/dashboard-prospectos-equipo";
import { DashboardProspectosMetricas } from "@/components/system/dashboard/dashboard-prospectos-metricas";
import { auth } from "@/lib/auth";

const ROLES_GERENCIALES = ["MANAGER", "ADMIN", "SUPER_ADMIN"] as const;

type RolGerencial = (typeof ROLES_GERENCIALES)[number];

function esRolGerencial(rol: string): rol is RolGerencial {
  return ROLES_GERENCIALES.includes(rol as RolGerencial);
}

export default async function DashboardComercialPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/sign-in");

  const rol = session.user.role ?? "USER";
  if (!esRolGerencial(rol)) redirect("/dashboard");

  return (
    <div className="flex-1">
      <div className="px-8 pt-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Comercial</h1>
        <p className="text-muted-foreground">
          Dirección comercial NEXUS: prospectos, embudo, conversión, fuentes, seguimiento y desempeño del equipo.
        </p>
      </div>
      <DashboardAccesosComerciales />
      <DashboardProspectosMetricas />
      <DashboardProspectosEquipo />
    </div>
  );
}
