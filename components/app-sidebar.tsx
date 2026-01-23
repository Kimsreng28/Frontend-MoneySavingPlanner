"use client";

import * as React from "react";
import {
  Bell,
  Command,
  Goal,
  LayoutDashboard,
  LifeBuoy,
  Send,
  Settings2,
  SquareCheckBig,
  TrendingUp,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
    },
    {
      title: "Saving Plans",
      url: "#",
      icon: Goal,
      items: [],
    },
    {
      title: "Tasks",
      url: "#",
      icon: SquareCheckBig,
      items: [],
    },
    {
      title: "Reports",
      url: "#",
      icon: TrendingUp,
      items: [],
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
      items: [],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">SaveWise</span>
                  <span className="truncate text-xs">Smart Savings</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation Platform (Dashboard, Saving Plans, Tasks, Reports, Notifications, Settings) */}
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
