import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProspectoDetalle } from "@/components/system/prospectos/prospecto-detalle";
import { ProspectoSeguimiento } from "@/components/system/prospectos/prospecto-seguimiento";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ProspectoPage({
  params,
}: {
  params: Promise<{ prospectoId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { prospectoId } = await params;
  const prospecto = await db.prospecto.findFirst({
    where: { id: prospectoId, deletedAt: null },
    select: { convertido: true },
  });

  return (
    <div className="flex-1">
      <div className="px-8 pt-6">
        <Button asChild>
          <a href={`/prospectos/${prospectoId}/score`}>Evaluar Score NEXUS</a>
        </Button>
      </div>
      <ProspectoDetalle prospectoId={prospectoId} />
      {prospecto && (
        <div className="px-8 pb-8">
          <ProspectoSeguimiento
            prospectoId={prospectoId}
            convertido={prospecto.convertido}
          />
        </div>
      )}
    </div>
  );
}
