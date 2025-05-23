"use client"

import { useState, useEffect } from "react"
import { Frame, Map, PieChart, Settings2, Home, Building2, FileText, Users, ClipboardList, UserPlus } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { navigate } = useSafeNavigation()

  const userData = {
    name: user?.name || "User",
    email: `${user?.id_number || "user"}@emb.gov.ph`,
    avatar: "/placeholder.svg?height=32&width=32",
  }

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
      baseItems.push(
        {
          title: "User Management",
          url: "/users",
          icon: Users,
          isActive: window.location.pathname.startsWith("/users"),
          items: [
            {
              title: "All Users",
              url: "/users",
            },
            {
              title: "Add User",
              url: "/users",
              onClick: () => navigate("/users?action=add"),
              icon: UserPlus,
            },
          ],
        }
      )
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
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
            <img
              src="/assets/DENR-Logo.svg"
              alt="DENR Logo"
              className="h-8 w-8 rounded-full transition-all duration-200"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">EMB System</span>
              <span className="text-xs text-muted-foreground">Management Portal</span>
            </div>
          </div>
        </div>
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