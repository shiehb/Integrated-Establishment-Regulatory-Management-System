"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Initial notification preferences
const initialPreferences = {
  email: {
    permitApprovals: true,
    newApplications: true,
    inspectionSchedules: true,
    complianceIssues: true,
    systemUpdates: false,
  },
  inApp: {
    permitApprovals: true,
    newApplications: true,
    inspectionSchedules: true,
    complianceIssues: true,
    systemUpdates: true,
  },
  push: {
    permitApprovals: false,
    newApplications: false,
    inspectionSchedules: true,
    complianceIssues: true,
    systemUpdates: false,
  },
}

interface NotificationPreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationPreferencesDialog({ open, onOpenChange }: NotificationPreferencesDialogProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [activeTab, setActiveTab] = useState("inApp")
  const { toast } = useToast()

  const handleSwitchChange = (
    channel: keyof typeof preferences,
    setting: keyof typeof preferences.email,
    checked: boolean,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [setting]: checked,
      },
    }))
  }

  const handleSave = () => {
    // In a real app, you would save these preferences to the backend
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    })
    onOpenChange(false)
  }

  const handleReset = () => {
    setPreferences(initialPreferences)
    toast({
      title: "Preferences reset",
      description: "Your notification preferences have been reset to default.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>Customize how and when you receive notifications.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inApp">In-App</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="push">Push</TabsTrigger>
          </TabsList>

          <TabsContent value="inApp" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inApp-permitApprovals">Permit Approvals</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications when permits are approved</p>
                </div>
                <Switch
                  id="inApp-permitApprovals"
                  checked={preferences.inApp.permitApprovals}
                  onCheckedChange={(checked) => handleSwitchChange("inApp", "permitApprovals", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inApp-newApplications">New Applications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications for new permit applications</p>
                </div>
                <Switch
                  id="inApp-newApplications"
                  checked={preferences.inApp.newApplications}
                  onCheckedChange={(checked) => handleSwitchChange("inApp", "newApplications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inApp-inspectionSchedules">Inspection Schedules</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications about upcoming inspections</p>
                </div>
                <Switch
                  id="inApp-inspectionSchedules"
                  checked={preferences.inApp.inspectionSchedules}
                  onCheckedChange={(checked) => handleSwitchChange("inApp", "inspectionSchedules", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inApp-complianceIssues">Compliance Issues</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications about compliance issues</p>
                </div>
                <Switch
                  id="inApp-complianceIssues"
                  checked={preferences.inApp.complianceIssues}
                  onCheckedChange={(checked) => handleSwitchChange("inApp", "complianceIssues", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inApp-systemUpdates">System Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications about system updates and maintenance
                  </p>
                </div>
                <Switch
                  id="inApp-systemUpdates"
                  checked={preferences.inApp.systemUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("inApp", "systemUpdates", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-permitApprovals">Permit Approvals</Label>
                  <p className="text-xs text-muted-foreground">Receive email notifications when permits are approved</p>
                </div>
                <Switch
                  id="email-permitApprovals"
                  checked={preferences.email.permitApprovals}
                  onCheckedChange={(checked) => handleSwitchChange("email", "permitApprovals", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-newApplications">New Applications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive email notifications for new permit applications
                  </p>
                </div>
                <Switch
                  id="email-newApplications"
                  checked={preferences.email.newApplications}
                  onCheckedChange={(checked) => handleSwitchChange("email", "newApplications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-inspectionSchedules">Inspection Schedules</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive email notifications about upcoming inspections
                  </p>
                </div>
                <Switch
                  id="email-inspectionSchedules"
                  checked={preferences.email.inspectionSchedules}
                  onCheckedChange={(checked) => handleSwitchChange("email", "inspectionSchedules", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-complianceIssues">Compliance Issues</Label>
                  <p className="text-xs text-muted-foreground">Receive email notifications about compliance issues</p>
                </div>
                <Switch
                  id="email-complianceIssues"
                  checked={preferences.email.complianceIssues}
                  onCheckedChange={(checked) => handleSwitchChange("email", "complianceIssues", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-systemUpdates">System Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive email notifications about system updates and maintenance
                  </p>
                </div>
                <Switch
                  id="email-systemUpdates"
                  checked={preferences.email.systemUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("email", "systemUpdates", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="push" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-permitApprovals">Permit Approvals</Label>
                  <p className="text-xs text-muted-foreground">Receive push notifications when permits are approved</p>
                </div>
                <Switch
                  id="push-permitApprovals"
                  checked={preferences.push.permitApprovals}
                  onCheckedChange={(checked) => handleSwitchChange("push", "permitApprovals", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-newApplications">New Applications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive push notifications for new permit applications
                  </p>
                </div>
                <Switch
                  id="push-newApplications"
                  checked={preferences.push.newApplications}
                  onCheckedChange={(checked) => handleSwitchChange("push", "newApplications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-inspectionSchedules">Inspection Schedules</Label>
                  <p className="text-xs text-muted-foreground">Receive push notifications about upcoming inspections</p>
                </div>
                <Switch
                  id="push-inspectionSchedules"
                  checked={preferences.push.inspectionSchedules}
                  onCheckedChange={(checked) => handleSwitchChange("push", "inspectionSchedules", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-complianceIssues">Compliance Issues</Label>
                  <p className="text-xs text-muted-foreground">Receive push notifications about compliance issues</p>
                </div>
                <Switch
                  id="push-complianceIssues"
                  checked={preferences.push.complianceIssues}
                  onCheckedChange={(checked) => handleSwitchChange("push", "complianceIssues", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-systemUpdates">System Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive push notifications about system updates and maintenance
                  </p>
                </div>
                <Switch
                  id="push-systemUpdates"
                  checked={preferences.push.systemUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("push", "systemUpdates", checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
