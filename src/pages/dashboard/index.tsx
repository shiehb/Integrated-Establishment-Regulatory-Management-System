"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataCards } from "@/components/dashboard/data-cards"
import { VisualizationCharts } from "@/components/dashboard/visualization-charts"
import { ActivityFeed } from "@/components/dashboard/activity-feed"

export default function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <Header/>

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
    </SidebarProvider>
  )
}
