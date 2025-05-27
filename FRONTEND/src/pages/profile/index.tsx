"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Mail,
  BadgeIcon as IdCard,
  Calendar,
  Pencil,
  Key,
} from "lucide-react"
import { format } from "date-fns"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"
import { SiteHeader } from "@/components/site-header"
import { useUser } from "@/hooks/use-user"
import { useAvatar } from "@/hooks/use-avatar"

export default function ProfilePage() {
  const { user } = useUser()
  const { avatarUrl } = useAvatar()
  const { navigate } = useSafeNavigation()

  const creationDate = new Date(2023, 0, 15)

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

  if (!user) return null

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-2 pt-2 overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex flex-col gap-4">
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Profile Settings
                  </CardTitle>
                  </div>
                </CardHeader>

                <div className="px-6 grid gap-6 md:grid-cols-[1fr_2fr]">
                  {/* Left Panel */}
                  <Card className="shadow-sm">
                    <CardHeader className="items-center text-center space-y-4">
                      <Avatar className="h-24 w-24 mx-auto">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={user.name} />
                        ) : (
                          <AvatarFallback className="text-2xl">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle>{user.name}</CardTitle>
                        <div className="mt-2 flex flex-col items-center text-white">
                          {getUserLevelBadge(user.userlevel)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
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
                        <span>
                          Member since {format(creationDate, "MMMM d, yyyy")}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <Button
                        className="w-full"
                        onClick={() => navigate("/profile/edit")}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/profile/edit")}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Right Panel */}
                  <div className="flex flex-col gap-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                          Your personal account details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <Info label="Full Name" value={user.name ?? "N/A"} />
                        <Info label="Email Address" value={user.email ?? "N/A"} />
                        <Info label="ID Number" value={user.id_number ?? "N/A"} />
                        <Info label="User Level" value={user.userlevel ?? "N/A"} capitalize />
                        <Info label="Account Status" value="Active" />
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>
                          Manage your account security
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div>
                          <h3 className="font-medium text-muted-foreground">
                            Password
                          </h3>
                          <p>Last changed 30 days ago</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate("/profile/edit")}
                        >
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

function Info({
  label,
  value,
  capitalize = false,
}: {
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div>
      <h3 className="font-medium text-muted-foreground">{label}</h3>
      <p className={capitalize ? "capitalize" : ""}>{value}</p>
    </div>
  )
}
