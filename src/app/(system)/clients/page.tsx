// src/app/(system)/clients/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClientsContainer } from "@/components/system/clientes/clients-container";
import { auth } from "@/lib/auth";

export default async function ClientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <ClientsContainer />;
}
