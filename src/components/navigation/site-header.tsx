// src/components/navigation/site-header.tsx
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
    <header className="sticky top-0 z-50 flex w-full items-center border-b border-blue-100/80 bg-white/95 shadow-[0_1px_18px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button className="h-7 w-7 text-slate-600 hover:bg-blue-50 hover:text-blue-700" variant="ghost" size="icon" onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DynamicBreadcrumbs />
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">GO USA NEXUS</span>
        </div>
        <SearchForm className="w-full sm:ml-auto sm:w-auto lg:ml-2" />
        <ModeToggle />
      </div>
    </header>
  );
}
