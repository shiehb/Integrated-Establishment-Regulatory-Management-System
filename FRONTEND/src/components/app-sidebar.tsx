import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { type UserLevel } from "@/types/user"
import {
  ClipboardList,
  FileText,
  Map,
  User2,
  PieChart,
  Settings2,
  Building2,
  BadgeInfo,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
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
import { useAuth } from "@/hooks/use-auth"

interface BaseNavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  requiredLevel?: UserLevel | UserLevel[]
}

interface NavItemWithChildren extends BaseNavItem {
  items: NavItem[]
}

type NavItem = BaseNavItem | NavItemWithChildren

type NavComponentItem = {
  title: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavComponentItem[]
  onClick?: () => void
}

const navItems = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
      requiredLevel: ["admin", "manager", "inspector"],
    },
    {
      title: "Map",
      url: "/map",
      icon: Map,
      requiredLevel: ["admin", "manager", "inspector"],
    },
    {
      title: "Establishments",
      url: "#",
      icon: Building2,
      requiredLevel: ["admin", "manager", "inspector"],
      items: [
        {
          title: "All Establishments",
          url: "/establishments",
          requiredLevel: ["admin", "manager"],
        },
        {
          title: "Add Establishment",
          url: "/establishments/add",
          requiredLevel: ["admin", "manager"],
        },
        {
          title: "Establishment Areas",
          url: "/establishments/areas",
          requiredLevel: ["admin", "manager", "inspector"],
        },
      ],
    },
    {
      title: "Inspections",
      url: "#",
      icon: ClipboardList,
      requiredLevel: ["admin", "manager", "inspector"],
      items: [
        {
          title: "All Inspections",
          url: "/inspections",
          requiredLevel: ["admin", "manager"],
        },
        {
          title: "Add Inspection",
          url: "/inspections/add",
          requiredLevel: ["admin", "manager"],
        },
        {
          title: "Inspections Pending",
          url: "/inspections/pending",
          requiredLevel: ["admin", "inspector"],
        },
      ],
    },
    {
      title: "Compliance",
      url: "/compliance",
      icon: FileText,
      requiredLevel: ["admin", "manager"],
      items: [],
    },
    {
      title: "Reports",
      url: "#",
      icon: FileText,
      requiredLevel: ["admin", "manager"],
      items: [
        { title: "All Reports", url: "/reports" },
        { title: "Add Report", url: "/reports/add" },
        { title: "Documents", url: "/reports/documents" },
      ],
    },
    {
      title: "User Management",
      url: "/users",
      icon: User2,
      requiredLevel: "admin",
      items: [
        { title: "All Users", url: "/users" },
        { title: "Add New User", url: "/users?action=add" },
        { title: "Profile", url: "/profile" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      requiredLevel: ["admin"], // Restrict settings to admin only
      items: [
        {
          title: "General",
          url: "/settings/general",
          requiredLevel: ["admin"],
        },
        {
          title: "About",
          url: "/settings/about",
          requiredLevel: ["admin"],
        },
      ],
    },
  ] as NavItem[],
  navSecondary: [
    {
      title: "Version 1.0.0",
      url: "/about",
      icon: BadgeInfo,
    },
  ] as NavItem[],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const filterAndTransformItems = (items: NavItem[]): NavComponentItem[] => {
    if (!user) return []

    return items.reduce<NavComponentItem[]>((acc, item) => {
      const canSeeItem =
        !item.requiredLevel ||
        (Array.isArray(item.requiredLevel)
          ? item.requiredLevel.includes(user.user_level)
          : item.requiredLevel === user.user_level)

      if (!canSeeItem) return acc

      const isItemActive = item.url === "#" 
        ? false 
        : location.pathname === item.url || location.pathname.startsWith(item.url + "/")

      const navItem: NavComponentItem = {
        title: item.title,
        icon: item.icon,
        isActive: isItemActive,
        onClick: () => {
          if (item.url && item.url !== "#") {
            navigate(item.url)
          }
        },
      }

      if ("items" in item && item.items?.length > 0) {
        const subItems = filterAndTransformItems(item.items)
        if (subItems.length > 0) {
          navItem.items = subItems
          // Set parent as active if any child is active
          navItem.isActive = subItems.some((subItem) => subItem.isActive)
        }
      }

      acc.push(navItem)
      return acc
    }, [])
  }

  const filteredNavMain = filterAndTransformItems(navItems.navMain)
  const filteredNavSecondary = filterAndTransformItems(navItems.navSecondary)

  return (
    <Sidebar
      className="top-[var(--header-height)] h-[calc(100svh-var(--header-height))]"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarFooter>
    </Sidebar>
  )
}
