import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProspectoConvertirClienteForm } from "@/components/system/prospectos/prospecto-convertir-cliente-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { puedeAccederProspecto } from "@/lib/prospectos/permisos";

export default async function ConvertirProspectoClientePage({
  params,
}: {
  params: Promise<{ prospectoId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const { prospectoId } = await params;
  if (!(await puedeAccederProspecto(session.user.id, prospectoId))) redirect("/prospectos");

  const [prospecto, regiones] = await Promise.all([
    db.prospecto.findFirst({
      where: { id: prospectoId, deletedAt: null },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        telefono: true,
        pais: true,
        convertido: true,
        clienteId: true,
      },
    }),
    db.region.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  if (!prospecto) redirect("/prospectos");
  if (prospecto.convertido || prospecto.clienteId) redirect(`/prospectos/${prospectoId}`);

  return <ProspectoConvertirClienteForm prospecto={prospecto} regiones={regiones} />;
}
