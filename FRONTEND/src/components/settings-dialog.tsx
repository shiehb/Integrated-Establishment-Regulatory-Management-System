"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { Label } from "@/components/ui/label"
import { UserProfileDetails } from "@/components/settings/user-profile-details"

import { useEffect, useState } from "react"

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { theme, setTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Sync switch with current theme
  useEffect(() => {
    setIsDarkMode(theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))
  }, [theme])

  function handleToggleTheme(enabled: boolean) {
    setIsDarkMode(enabled)
    setTheme(enabled ? "dark" : "light")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4 w-full">
          <TabsList className="w-full justify-between">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode-toggle">Dark Mode</Label>
              </div>
              <div className="text-sm text-muted-foreground">
                Automatically adjusts between light and dark modes.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="pt-4">
            <UserProfileDetails />
            </TabsContent>

            <TabsContent value="about" className="pt-4">
            <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                <strong>IER Management System</strong> v1.0 – developed for{" "}
                <span className="text-foreground font-medium">DENR Region 1</span>.
                </p>
                <p>
                Learn more at{" "}
                <a
                    href="https://www.denr.gov.ph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                >
                    www.denr.gov.ph
                </a>
                </p>
            </div>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
