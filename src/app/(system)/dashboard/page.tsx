// src/app/(system)/dashboard/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { DashboardBienvenida } from "@/components/system/dashboard/dashboard-bienvenida";
import { DashboardContainer } from "@/components/system/dashboard/dashboard-container";
import { EntrevistasHoyCard } from "@/components/system/dashboard/entrevistas-hoy-card";
import { AgendaHoyCard } from "@/components/system/dashboard/agenda-hoy-card";
import { auth } from "@/lib/auth";

const ROLES_GERENCIALES = ["MANAGER", "ADMIN", "SUPER_ADMIN"] as const;
type RolGerencial = (typeof ROLES_GERENCIALES)[number];
function esRolGerencial(rol: string): rol is RolGerencial { return ROLES_GERENCIALES.includes(rol as RolGerencial); }

function DashboardTime(){
  return (
    <section className="px-8 pt-6">
      <div className="mb-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-background to-background p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><Clock3 className="h-6 w-6"/></div>
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold tracking-tight">NEXUS · Dashboard Time</h1><span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">Operación</span></div>
            <p className="mt-1 text-sm text-muted-foreground">Tu agenda operativa: entrevistas, simulacros, asesorías, recordatorios y pendientes próximos.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4"><EntrevistasHoyCard/><AgendaHoyCard/></div>
    </section>
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const rol = session.user.role ?? "USER";
  if (esRolGerencial(rol)) return <div className="flex-1"><DashboardTime/><DashboardContainer nombreUsuario={session.user.name} rol={rol}/></div>;
  return <div className="flex-1"><DashboardTime/><DashboardBienvenida nombre={session.user.name} rol={rol}/></div>;
}
