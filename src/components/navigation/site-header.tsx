"use client";

import { SidebarIcon } from "lucide-react";
import { DynamicBreadcrumbs } from "@/components/navigation/dynamic-breadcrumbs";
import { SearchForm } from "@/components/navigation/search-form";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100/80 bg-white/95 shadow-[0_1px_18px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-3 sm:px-4 md:px-6">
        <Button
          className="h-9 w-9 shrink-0 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Abrir o cerrar menú principal"
        >
          <SidebarIcon className="size-4" />
        </Button>
        <Separator orientation="vertical" className="mr-1 hidden h-5 sm:block" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <DynamicBreadcrumbs />
        </div>
        <span className="hidden shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 xl:inline-flex">
          GO USA NEXUS
        </span>
        <div className="hidden md:block">
          <SearchForm className="w-[220px] lg:w-[280px]" />
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}
