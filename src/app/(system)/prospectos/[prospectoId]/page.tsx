import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProspectoDetalle } from "@/components/system/prospectos/prospecto-detalle";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

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

  return (
    <div className="flex-1">
      <div className="px-8 pt-6">
        <Button asChild>
          <a href={`/prospectos/${prospectoId}/score`}>Evaluar Score NEXUS</a>
        </Button>
      </div>
      <ProspectoDetalle prospectoId={prospectoId} />
    </div>
  );
}
