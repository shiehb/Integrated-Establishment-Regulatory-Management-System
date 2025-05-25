"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ShieldCheck, Activity, Mail, BadgeIcon as IdCard, Calendar, Pencil, Key } from "lucide-react"
import { format } from "date-fns"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"
import { SiteHeader } from "@/components/site-header"
import { useUser } from "@/hooks/use-user"
import { useAvatar } from "@/hooks/use-avatar"

export default function ProfilePage() {
  const { user } = useUser()
  const { avatarUrl } = useAvatar()
  const { navigate } = useSafeNavigation()

  // Mock creation date for the profile
  const creationDate = new Date(2023, 0, 15)

  // Get user level badge
  const getUserLevelBadge = (userlevel?: string) => {
    switch (userlevel) {
      case "admin":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            Administrator
          </Badge>
        )
      case "manager":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-500">
            <ShieldCheck className="h-3 w-3" />
            Manager
          </Badge>
        )
      case "inspector":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Inspector
          </Badge>
        )
      default:
        return null
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
    <SidebarProvider className="flex flex-col">
      <SiteHeader />
      <div className="flex flex-1">
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">View and manage your account information.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-2xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <CardTitle>{user.name}</CardTitle>
                <div className="flex justify-center mt-2">{getUserLevelBadge(user.userlevel)}</div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  <span>ID: {user.id_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member since {format(creationDate, "MMMM d, yyyy")}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => navigate("/profile/edit")}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/profile/edit")}>
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </CardFooter>
            </Card>

            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your personal account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Full Name</h3>
                    <p>{user.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Email Address</h3>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">ID Number</h3>
                    <p>{user.id_number}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">User Level</h3>
                    <p className="capitalize">{user.userlevel}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Account Status</h3>
                    <p>Active</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Password</h3>
                    <p>Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/profile/edit")}>
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
      </div>
    </SidebarProvider>
    </div>
  )
}
