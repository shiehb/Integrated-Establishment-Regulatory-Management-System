import * as React from "react"
import {
  ClipboardList,
  FileText,
  LifeBuoy,
  Map,
  User2,
  PieChart,
  Send,
  Settings2,
  Building2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "User Management",
      url: "/users",
      icon: User2,
      isActive: true,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
      isActive: false,

    },
     {
      title: "Map",
      url: "#",
      icon: Map,
    },
    {
      title: "Establishments",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "All Establishments",
          url: "#",
        },
        {
          title: "Add Establishment",
          url: "#",
        },
        {
          title: "Establishment Areas",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "All Reports",
          url: "#",
        },
        {
          title: "Add Report",
          url: "#",
        },
        {
          title: "Report Categories",
          url: "#",
        },
      ],
    },
    {
      title: "Inspections",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "All Inspections",
          url: "#",
        },
        {
          title: "Add Inspection",
          url: "#",
        },
        {
          title: "Inspection Types",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarFooter>
    </Sidebar>
  )
}
