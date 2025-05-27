"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Calendar,
  IdCard,
  Key,
  Mail,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Activity,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"
import { format } from "date-fns"

export function UserProfileDetails() {
  const { user } = useAuth()
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
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg" alt={user.name} />
            <AvatarFallback className="text-2xl">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle>{user.name}</CardTitle>
        <div className="flex justify-center mt-2">
          {getUserLevelBadge(user.userlevel)}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{`${user.id_number}@emb.gov.ph`}</span>
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
  )
}
