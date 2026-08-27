import { headers } from "next/headers";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUser = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    : null;

  return (
    <main className="min-h-svh bg-slate-50/70 [--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar role={currentUser?.role ?? null} />
          <SidebarInset className="min-w-0 bg-transparent">
            <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col px-3 py-4 sm:px-4 md:px-6 md:py-6 xl:px-8">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </main>
  );
}
