"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { NotificationPreferencesDialog } from "@/components/notifications/notification-preferences"

// Sample notification data
const initialNotifications = [
  {
    id: "1",
    title: "Permit Approved",
    description: "Permit #1023 for Green Earth Recycling has been approved.",
    time: "2 hours ago",
    read: false,
    type: "success",
  },
  {
    id: "2",
    title: "New Application",
    description: "Metro Water Treatment submitted a new permit application.",
    time: "4 hours ago",
    read: false,
    type: "info",
  },
  {
    id: "3",
    title: "Inspection Scheduled",
    description: "Inspection for Sunrise Manufacturing scheduled for tomorrow at 10:00 AM.",
    time: "Yesterday",
    read: false,
    type: "warning",
  },
  {
    id: "4",
    title: "Compliance Issue",
    description: "Harbor Industrial Complex has a compliance issue that needs attention.",
    time: "2 days ago",
    read: true,
    type: "error",
  },
  {
    id: "5",
    title: "System Update",
    description: "The system will undergo maintenance on Saturday at 11:00 PM.",
    time: "3 days ago",
    read: true,
    type: "info",
  },
]

// Map notification types to colors and icons
const typeStyles = {
  success: "bg-green-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [open, setOpen] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const { toast } = useToast()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast({
      title: "Notifications marked as read",
      description: "All notifications have been marked as read.",
    })
  }

  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared.",
    })
    setOpen(false)
  }

  // Simulate receiving a new notification
  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotification = {
        id: Date.now().toString(),
        title: "New Notification",
        description: "This is a simulated new notification for demonstration purposes.",
        time: "Just now",
        read: false,
        type: "info" as const,
      }

      setNotifications((prev) => [newNotification, ...prev])

      toast({
        title: "New Notification",
        description: "You have received a new notification.",
      })
    }, 30000) // Show a new notification after 30 seconds

    return () => clearTimeout(timer)
  }, [toast])

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {notifications.length > 0 ? (
            <>
              <ScrollArea className="h-[300px]">
                <DropdownMenuGroup>
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "flex flex-col items-start p-3 cursor-default",
                        !notification.read && "bg-muted/50",
                      )}
                      onSelect={(e) => {
                        e.preventDefault()
                        markAsRead(notification.id)
                      }}
                    >
                      <div className="flex w-full gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 mt-1.5 rounded-full",
                            typeStyles[notification.type as keyof typeof typeStyles],
                          )}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.description}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </ScrollArea>

              <DropdownMenuSeparator />
              <div className="flex items-center justify-between p-2">
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={markAllAsRead}>
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Mark all as read
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={clearAll}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  Clear all
                </Button>
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              <p>No notifications</p>
            </div>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex justify-center cursor-default"
            onSelect={(e) => {
              e.preventDefault()
              setPreferencesOpen(true)
              setOpen(false)
            }}
          >
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Notification Settings
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationPreferencesDialog open={preferencesOpen} onOpenChange={setPreferencesOpen} />
    </>
  )
}
