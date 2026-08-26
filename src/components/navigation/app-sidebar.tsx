"use client";

import {
  AppWindowIcon,
  BarChart3Icon,
  CalendarIcon,
  CommandIcon,
  GaugeIcon,
  NotebookIcon,
  SettingsIcon,
  UserPlusIcon,
  UsersIcon,
  PlaneIcon,
  Building2Icon,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/navigation/nav-main";
import { NavUser } from "@/components/navigation/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const data = {
  navMain: [
    { title: "Dashboard Time", url: "/dashboard", icon: AppWindowIcon },
    { title: "Dashboard Comercial", url: "/dashboard-comercial", icon: BarChart3Icon },
    { title: "NEXUS Score 2.0", url: "/nexus-score", icon: GaugeIcon },
    { title: "Prospectos", url: "/prospectos", icon: UserPlusIcon },
    { title: "Clientes", url: "/clients", icon: UsersIcon },
    { title: "Trámites", url: "/tramites", icon: NotebookIcon },
    { title: "Visa China", url: "/visa-china", icon: Building2Icon },
    { title: "Citas", url: "/citas", icon: CalendarIcon },
    { title: "Servicios", url: "/servicios", icon: PlaneIcon },
    { title: "Usuarios", url: "/administration", icon: UsersIcon },
    { title: "Configuraciones", url: "/settings", icon: SettingsIcon },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="top-(--header-height) h-[calc(100svh-var(--header-height))]! border-r border-blue-100/80" {...props}>
      <SidebarHeader className="border-b border-blue-100/70 bg-gradient-to-b from-blue-50/90 to-white">
        <SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" asChild><a href="/dashboard">
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-sm shadow-blue-500/30"><CommandIcon className="size-4" /></div>
          <div className="grid flex-1 text-left leading-tight"><span className="truncate text-sm font-extrabold tracking-wide text-slate-950">GO USA <span className="text-blue-700">NEXUS</span></span><span className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inteligencia operativa</span></div>
        </a></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-b from-white via-white to-slate-50/80"><NavMain items={data.navMain} /></SidebarContent>
      <SidebarFooter className="border-t border-slate-100 bg-white"><NavUser /></SidebarFooter>
    </Sidebar>
  );
}
