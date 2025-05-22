import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, FileText, UserCheck, Calendar } from "lucide-react"

// Sample activity data
const activities = [
  {
    id: 1,
    type: "approval",
    title: "Permit #1023 was approved",
    description: "Establishment: Green Earth Recycling",
    time: "2 hours ago",
    icon: CheckCircle,
  },
  {
    id: 2,
    type: "pending",
    title: "New application submitted",
    description: "Establishment: Metro Water Treatment",
    time: "4 hours ago",
    icon: Clock,
  },
  {
    id: 3,
    type: "inspection",
    title: "Inspection scheduled",
    description: "Establishment: Sunrise Manufacturing",
    time: "Yesterday at 2:30 PM",
    icon: Calendar,
  },
  {
    id: 4,
    type: "document",
    title: "Documents uploaded",
    description: "Establishment: Pacific Waste Management",
    time: "Yesterday at 10:15 AM",
    icon: FileText,
  },
  {
    id: 5,
    type: "user",
    title: "New user registered",
    description: "User: Maria Santos (Inspector)",
    time: "2 days ago",
    icon: UserCheck,
  },
  {
    id: 6,
    type: "alert",
    title: "Compliance issue detected",
    description: "Establishment: Harbor Industrial Complex",
    time: "2 days ago",
    icon: AlertCircle,
  },
  {
    id: 7,
    type: "approval",
    title: "Permit #985 was approved",
    description: "Establishment: Greenfield Processors",
    time: "3 days ago",
    icon: CheckCircle,
  },
]

// Map activity types to colors
const typeColors = {
  approval: "bg-green-500",
  pending: "bg-amber-500",
  inspection: "bg-blue-500",
  document: "bg-slate-500",
  user: "bg-purple-500",
  alert: "bg-red-500",
}

export function ActivityFeed() {
  return (
    <Card className="col-span-1 lg:col-span-1 h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <Badge variant="outline" className="ml-2">
            {activities.length} new
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-full p-1.5 ${typeColors[activity.type as keyof typeof typeColors]}`}>
                  <activity.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
