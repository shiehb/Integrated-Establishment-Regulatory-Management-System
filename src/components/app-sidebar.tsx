"use client"

import type * as React from "react"
import { Frame, Map, PieChart, Settings2, Home, Building2, FileText, Users, ClipboardList } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()


  const getNavItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        isActive: window.location.pathname === "/dashboard",
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          },
          {
            title: "Analytics",
            url: "#",
          },
          {
            title: "Reports",
            url: "#",
          },
        ],
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
            title: "Add New",
            url: "#",
          },
          {
            title: "Categories",
            url: "#",
          },
        ],
      },
      {
        title: "Permits",
        url: "#",
        icon: FileText,
        items: [
          {
            title: "All Permits",
            url: "#",
          },
          {
            title: "Pending",
            url: "#",
          },
          {
            title: "Approved",
            url: "#",
          },
          {
            title: "Expired",
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
            title: "Schedule",
            url: "#",
          },
          {
            title: "Reports",
            url: "#",
          },
          {
            title: "Templates",
            url: "#",
          },
        ],
      },
    ]

    // Add admin-specific items
    if (user?.userlevel === "admin") {
      baseItems.push({
        title: "User Management",
        url: "/users",
        icon: Users,
        isActive: window.location.pathname === "/users",
        items: [], // This can now be empty or undefined
      })
    }

    baseItems.push({
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "System",
          url: "#",
        },
        {
          title: "Notifications",
          url: "#",
        },
      ],
    })

    return baseItems
  }

  const data = {
    navMain: getNavItems(),
    projects: [
      {
        name: "Pollution Control",
        url: "#",
        icon: Frame,
      },
      {
        name: "Waste Management",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Environmental Impact",
        url: "#",
        icon: Map,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex  justify-between">
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
