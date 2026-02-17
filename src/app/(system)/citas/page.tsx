// src/app/(system)/citas/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CitasContainer } from "@/components/system/citas/citas-container";
import { auth } from "@/lib/auth";

export default async function CitasPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <CitasContainer />;
}
