import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { VuelosContainer } from "@/components/system/servicios/vuelos/vuelos-container";

export default async function VuelosPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <VuelosContainer />;
}
