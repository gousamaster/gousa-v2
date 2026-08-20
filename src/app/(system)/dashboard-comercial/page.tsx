import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardAccesosComerciales } from "@/components/system/dashboard/dashboard-accesos-comerciales";
import { DashboardComercialPersonal } from "@/components/system/dashboard/dashboard-comercial-personal";
import { DashboardProspectosEquipo } from "@/components/system/dashboard/dashboard-prospectos-equipo";
import { DashboardProspectosMetricas } from "@/components/system/dashboard/dashboard-prospectos-metricas";
import { auth } from "@/lib/auth";

const ROLES_GLOBALES = new Set(["SUPER_ADMIN", "MANAGER"]);

export default async function DashboardComercialPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) redirect("/sign-in");

  const rol = session.user.role ?? "USER";
  const accesoGlobal = ROLES_GLOBALES.has(rol);

  return (
    <div className="flex-1">
      <div className="px-8 pt-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Comercial</h1>
        <p className="text-muted-foreground">
          {accesoGlobal
            ? "Dirección comercial NEXUS: prospectos, embudo, conversión, fuentes, seguimiento y desempeño del equipo."
            : "Tu gestión comercial NEXUS: cartera, cierres, clientes, ventas y seguimientos personales."}
        </p>
      </div>

      {accesoGlobal ? (
        <>
          <DashboardAccesosComerciales />
          <DashboardProspectosMetricas />
          <DashboardProspectosEquipo />
        </>
      ) : (
        <DashboardComercialPersonal userId={session.user.id} nombre={session.user.name} />
      )}
    </div>
  );
}
