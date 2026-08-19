import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProspectoDetalle } from "@/components/system/prospectos/prospecto-detalle";

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

  return <ProspectoDetalle prospectoId={prospectoId} />;
}
