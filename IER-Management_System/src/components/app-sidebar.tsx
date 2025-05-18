"use client"

import type * as React from "react"
import {
  Command,
  Frame,
  Map,
  PieChart,
  Settings2,
  Home,
  Building2,
  FileText,
  Users,
  ClipboardList,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Create user data for the sidebar
  const userData = {
    name: user?.name || "User",
    email: `${user?.id_number || "user"}@emb.gov.ph`,
    avatar: "/placeholder.svg?height=32&width=32",
  }

  // Define navigation items based on user level
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

    // Add admin-only items
    if (user?.userlevel === "admin") {
      baseItems.push({
        title: "User Management",
        url: "/users",
        icon: Users,
        isActive: window.location.pathname === "/users",
        items: [
          {
            title: "All Users",
            url: "/users",
          }
        ],
      })
    }

    // Add settings for all users
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

  // This is sample data.
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
      <SidebarHeader>
        <SidebarTrigger>
          <span className="sr-only">Toggle Sidebar</span>
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
