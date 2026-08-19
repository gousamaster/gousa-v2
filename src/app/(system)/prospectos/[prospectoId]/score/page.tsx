import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProspectoScoreNexus } from "@/components/system/prospectos/prospecto-score-nexus";
import { auth } from "@/lib/auth";

export default async function ProspectoScorePage({
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

  return <ProspectoScoreNexus prospectoId={prospectoId} />;
}
