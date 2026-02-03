// src/app/(system)/settings/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsContainer } from "@/components/system/settings/settings-container";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <div>En desarrollo</div>;
}
