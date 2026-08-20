import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProspectoAuditoria } from "@/components/system/prospectos/prospecto-auditoria";
import { ProspectoDetalle } from "@/components/system/prospectos/prospecto-detalle";
import { ProspectoHistorial } from "@/components/system/prospectos/prospecto-historial";
import { ProspectoSeguimiento } from "@/components/system/prospectos/prospecto-seguimiento";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { puedeAccederProspecto } from "@/lib/prospectos/permisos";

export default async function ProspectoPage({ params }: { params: Promise<{ prospectoId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const { prospectoId } = await params;
  if (!(await puedeAccederProspecto(session.user.id, prospectoId))) redirect("/prospectos");

  const prospecto = await db.prospecto.findFirst({
    where: { id: prospectoId, deletedAt: null },
    select: { convertido: true },
  });
  if (!prospecto) redirect("/prospectos");

  return (
    <div className="flex-1">
      <div className="px-8 pt-6">
        <Button asChild>
          <a href={`/prospectos/${prospectoId}/score`}>Evaluar Score NEXUS</a>
        </Button>
      </div>

      <div className="space-y-6 px-8 pt-6">
        <ProspectoSeguimiento prospectoId={prospectoId} convertido={prospecto.convertido} />
        <ProspectoHistorial prospectoId={prospectoId} />
        <ProspectoAuditoria prospectoId={prospectoId} />
      </div>

      <ProspectoDetalle prospectoId={prospectoId} />
    </div>
  );
}
