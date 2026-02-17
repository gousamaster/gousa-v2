// src/app/(system)/tramites/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TramitesContainer } from "@/components/system/tramites/tramites-container";
import { auth } from "@/lib/auth";

export default async function TramitesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <TramitesContainer />;
}
