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
import type {   LucideIcon } from "lucide-react"

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

// Define strict types for our navigation items
type UserLevel = 'admin' | 'manager' | 'inspector'

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

// Type for items that NavMain/NavSecondary expect
type NavComponentItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavComponentItem[]
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
      url: "#",
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
          url: "#",
          requiredLevel: ["admin", "manager"],
        },
        {
          title: "Add Establishment",
          url: "#",
          requiredLevel: ["admin", "manager"],
        },
        {
          title: "Establishment Areas",
          url: "#",
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
          url: "#",
          requiredLevel: ["admin", "manager"],
        },
        {
          title: "Add Inspection",
          url: "#",
          requiredLevel: ["admin", "manager"],
        },
        {
          title: "Inspections Pending",
          url: "#",
          requiredLevel: ["admin", "inspector"],
        },
      ],
    },
    {
      title: "Compliance",
      url: "#",
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
        {
          title: "All Reports",
          url: "#",
        },
        {
          title: "Add Report",
          url: "#",
        },
        {
          title: "Documents",
          url: "#",
        },
      ],
    },
    {
      title: "Users",
      url: "/users",
      icon: User2,
      requiredLevel: "admin",
    },
    {
      title: "Settings",
      url: "/set",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Profile",
          url: "/profile",
        },
        {
          title: "About",
          url: "#",
        },
      ],
    },
  ] as NavItem[],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
      requiredLevel: ["admin", "manager", "inspector"],
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
      requiredLevel: ["admin", "manager", "inspector"],
    },
  ] as NavItem[],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const filterAndTransformItems = (items: NavItem[]): NavComponentItem[] => {
    if (!user) return []
    
    return items.reduce<NavComponentItem[]>((acc, item) => {
      // Check if user can see this item
      const canSeeItem = !item.requiredLevel || 
        (Array.isArray(item.requiredLevel) 
          ? item.requiredLevel.includes(user.userlevel)
          : item.requiredLevel === user.userlevel
    )
      
      if (!canSeeItem) return acc
      
      // Transform to NavComponentItem
      const transformedItem: NavComponentItem = {
        title: item.title,
        url: item.url,
        icon: item.icon,
        isActive: item.isActive,
      }

      // Handle sub-items if they exist
      if ('items' in item && item.items && item.items.length > 0) {
        const filteredSubItems = filterAndTransformItems(item.items)
        if (filteredSubItems.length > 0) {
          transformedItem.items = filteredSubItems
        }
      }

      acc.push(transformedItem)
      return acc
    }, [])
  }

  const filteredNavMain = filterAndTransformItems(navItems.navMain)
  const filteredNavSecondary = filterAndTransformItems(navItems.navSecondary)

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
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