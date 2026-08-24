"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: { title: string; url: string }[];
  }[];
}) {
  const pathname = usePathname();
  const isCurrent = (url: string) => pathname === url || (url !== "/dashboard" && pathname.startsWith(`${url}/`));

  return (
    <SidebarGroup className="px-2 py-3">
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const childActive = item.items?.some((subItem) => isCurrent(subItem.url)) ?? false;
          const active = isCurrent(item.url) || childActive;

          return (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive || childActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={active}
                  className="h-10 rounded-xl px-3 font-medium transition-colors data-[active=true]:bg-blue-50 data-[active=true]:font-semibold data-[active=true]:text-blue-800 data-[active=true]:shadow-sm"
                >
                  <a href={item.url} aria-current={active ? "page" : undefined}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="mt-1 rounded-lg transition-transform data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Abrir opciones de {item.title}</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="mx-3 border-blue-100 px-2 py-1">
                        {item.items.map((subItem) => {
                          const subActive = isCurrent(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subActive}
                                className="min-h-9 rounded-lg px-2.5 text-[13px] data-[active=true]:bg-blue-50 data-[active=true]:font-semibold data-[active=true]:text-blue-800"
                              >
                                <a href={subItem.url} aria-current={subActive ? "page" : undefined}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
