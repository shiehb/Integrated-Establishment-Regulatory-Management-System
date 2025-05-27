

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { DataCards } from "@/components/dashboard/data-cards"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { VisualizationCharts } from "@/components/dashboard/visualization-charts"

export default function Dashboard() {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
              <div className="grid gap-4 md:gap-8">

                <DataCards />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  
                  <VisualizationCharts />
                  
                  <ActivityFeed />
                  
                  </div>
                  
                </div>
                </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

