// pages/settings/index.tsx
"use client"

import { SettingsDialog } from "@/components/settings-dialog"
import { UserProfileDetails } from "@/components/settings/user-profile-details"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleToggleTheme = (enabled: boolean) => {
    setIsDarkMode(enabled)
    setTheme(enabled ? "dark" : "light")
  }

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-2 pt-2 overflow-hidden">
              <Card className="flex flex-col h-full overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                          Settings
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UserProfileDetails />
                        </CardContent>
                        </Card>

                        <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="dark-mode">Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                Toggle between light and dark theme
                                </p>
                            </div>
                            <Switch
                                id="dark-mode"
                                checked={isDarkMode}
                                onCheckedChange={handleToggleTheme}
                            />
                            </div>
                        </CardContent>
                        <CardTitle>About IER Management System</CardTitle>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                            <p className="font-medium">Version 1.0.0</p>
                            <p className="text-muted-foreground">
                                Developed for DENR Region 1
                            </p>
                            </div>
                            <div className="pt-2">
                            <Button variant="link" asChild>
                                <a 
                                href="https://www.denr.gov.ph/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                                >
                                Visit DENR Website
                                </a>
                            </Button>
                            </div>
                        </CardContent>
                        </Card>
                    </div>
                    </CardContent>
              </Card>

              <SettingsDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen} 
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}