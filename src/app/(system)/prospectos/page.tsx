import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProspectosContainer } from "@/components/system/prospectos/prospectos-container";

export default async function ProspectosPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <ProspectosContainer />;
}
