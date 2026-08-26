import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NexusScoreRapido } from "@/components/system/prospectos/nexus-score-rapido";

export default async function NexusScorePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  return <NexusScoreRapido />;
}
