"use client"

import { useState, useEffect, useRef } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/hooks/use-auth"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Activity,
  UserPlus,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  Ban,
  CheckCircle,
  InfoIcon,
  User,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  id_number: string
  email: string
  userlevel: "admin" | "manager" | "inspector"
  status: "active" | "inactive"
  createdAt: Date
  password?: string
}

type Activity = {
  type: string
  time: string
  description: string
  details?: string
  important?: boolean
}

type ActivityGroup = {
  date: string
  activities: Activity[]
}

const initialUsers: User[] = [
  {
    id: "1",
    name: "Admin",
    id_number: "12345678",
    email: "admin@emb.gov.ph",
    userlevel: "admin",
    status: "active",
    createdAt: new Date(2023, 0, 15),
  },
  {
    id: "2",
    name: "Manager",
    id_number: "87654321",
    email: "manager@emb.gov.ph",
    userlevel: "manager",
    status: "active",
    createdAt: new Date(2023, 1, 20),
  },
  {
    id: "3",
    name: "Inspector",
    id_number: "11223344",
    email: "inspector@emb.gov.ph",
    userlevel: "inspector",
    status: "active",
    createdAt: new Date(2023, 2, 10),
  },
  {
    id: "4",
    name: "John Doe",
    id_number: "55667788",
    email: "john.doe@emb.gov.ph",
    userlevel: "admin",
    status: "inactive",
    createdAt: new Date(2023, 3, 5),
  },
  {
    id: "5",
    name: "Jane Smith",
    id_number: "99001122",
    email: "jane.smith@emb.gov.ph",
    userlevel: "manager",
    status: "inactive",
    createdAt: new Date(2023, 4, 12),
  },
  {
    id: "6",
    name: "Alice Johnson",
    id_number: "33445566",
    email: "alice.johnson@emb.gov.ph",
    userlevel: "inspector",
    status: "active",
    createdAt: new Date(2023, 5, 8),
  },
  {
    id: "7",
    name: "Bob Brown",
    id_number: "77889900",
    email: "bob.brown@emb.gov.ph",
    userlevel: "admin",
    status: "active",
    createdAt: new Date(2023, 6, 3),
  },
  {
    id: "8",
    name: "Charlie Green",
    id_number: "22334455",
    email: "charlie.green@emb.gov.ph",
    userlevel: "manager",
    status: "active",
    createdAt: new Date(2023, 7, 10),
  },
  {
    id: "9",
    name: "Charle Green",
    id_number: "22336455",
    email: "charlie.een@emb.gov.ph",
    userlevel: "manager",
    status: "active",
    createdAt: new Date(2023, 7, 10),
  },
  {
    id: "10",
    name: "David White",
    id_number: "55667788",
    email: "charlien@emb.gov.ph",
    userlevel: "manager",
    status: "active",
    createdAt: new Date(2023, 7, 10),
  }
]

const activityGroups: ActivityGroup[] = [
  {
    date: "Today, May 22, 2025",
    activities: [
      {
        type: "Login",
        time: "10:30 AM",
        description: "User logged in from Chrome on Windows",
        details: "IP: 192.168.1.100\nLocation: Manila, PH",
      },
      {
        type: "Profile Update",
        time: "11:15 AM",
        description: "Updated email address",
        details: "Changed from old@email.com to new@email.com",
      },
    ],
  },
  {
    date: "Yesterday, May 21, 2025",
    activities: [
      {
        type: "Password Change",
        time: "2:45 PM",
        description: "Password was changed",
        important: true,
      },
      {
        type: "Login",
        time: "9:00 AM",
        description: "User logged in from Safari on MacOS",
      },
    ],
  },
  {
    date: "May 20, 2025",
    activities: [
      {
        type: "System Access",
        time: "3:30 PM",
        description: "Accessed user management module",
      },
    ],
  },
]

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  id_number: z.string().min(8, "ID Number must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
  userlevel: z.enum(["admin", "manager", "inspector"]),
})

type SortField = "name" | "id_number" | "email" | "userlevel" | "status" | "createdAt"
type SortDirection = "asc" | "desc"

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showAddConfirm, setShowAddConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [userToToggle, setUserToToggle] = useState<User | null>(null)
  const [formData, setFormData] = useState<z.infer<typeof userFormSchema> | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [activitySheetOpen, setActivitySheetOpen] = useState(false)
  const [selectedUserActivity, setSelectedUserActivity] = useState<User | null>(null)

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      id_number: "",
      email: "",
      userlevel: "inspector",
    },
  })

  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAddUserOpen && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isAddUserOpen])

const isMatch = (user: User) => {
  if (!searchTerm) return false;
  return (
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id_number.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(user.createdAt, "MMM d, yyyy").toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const processedUsers = users
  .filter((u) => !(u.userlevel === "admin" && u.id_number === currentUser?.id_number))
  .filter((u) => (filterLevel === "all" ? true : u.userlevel === filterLevel))
  .filter((u) => (filterStatus === "all" ? true : u.status === filterStatus))
  .sort((a, b) => {
    // First sort by match status (matched items first)
    const aMatch = isMatch(a);
    const bMatch = isMatch(b);
    
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    
    //  Existing sorting logic for items with same match status
    let comparison = 0;
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "id_number":
        comparison = a.id_number.localeCompare(b.id_number);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "userlevel":
        comparison = a.userlevel.localeCompare(b.userlevel);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "createdAt":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      default:
        comparison = 0;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const onSubmit = (data: z.infer<typeof userFormSchema>) => {
    if (!editingUser) {
      const isEmpty = Object.values(data).every((val) => val === "" || val === "inspector")
      if (isEmpty) {
        setIsAddUserOpen(false)
        return
      }
    }

    const isDuplicateId = users.some((u) => u.id_number === data.id_number && (!editingUser || u.id !== editingUser.id))
    const isDuplicateEmail = users.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase() && (!editingUser || u.id !== editingUser.id),
    )

    if (isDuplicateId) {
      setValidationError("ID Number already exists. Please use a different ID Number.")
      return
    }

    if (isDuplicateEmail) {
      setValidationError("Email address already exists. Please use a different email.")
      return
    }

    if (editingUser) {
      const isUnchanged =
        data.name === editingUser.name &&
        data.id_number === editingUser.id_number &&
        data.email === editingUser.email &&
        data.userlevel === editingUser.userlevel

      if (isUnchanged) {
        setIsAddUserOpen(false)
        setEditingUser(null)
        return
      }
      setShowEditConfirm(true)
    } else {
      setShowAddConfirm(true)
    }

    setFormData(data)
  }

  const confirmAddUser = () => {
    if (!formData) return

    const defaultPassword = `${formData.id_number.substring(0, 4)}@emb`
    const newUser: User = {
      id: crypto.randomUUID(),
      name: formData.name,
      id_number: formData.id_number,
      email: formData.email,
      userlevel: formData.userlevel,
      status: "active",
      createdAt: new Date(),
      password: defaultPassword,
    }
    setUsers([...users, newUser])
    form.reset()
    setIsAddUserOpen(false)
    setFormData(null)
    setShowAddConfirm(false)

    toast.success("User Added", {
      description: `${newUser.name} has been added successfully.`,
    })
  }

  const confirmEditUser = () => {
    if (!formData || !editingUser) return

    setUsers(
      users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name,
              id_number: formData.id_number,
              email: formData.email,
              userlevel: formData.userlevel,
            }
          : u,
      ),
    )
    form.reset()
    setIsAddUserOpen(false)
    setEditingUser(null)
    setFormData(null)
    setShowEditConfirm(false)

    toast.success("User Updated", {
      description: `${formData.name}'s information has been updated.`,
    })
  }

  const confirmToggleStatus = () => {
    if (!userToToggle) return

    const newStatus = userToToggle.status === "active" ? "inactive" : "active"

    setUsers(
      users.map((u) =>
        u.id === userToToggle.id
          ? {
              ...u,
              status: newStatus,
            }
          : u,
      ),
    )
    setUserToToggle(null)
    setShowStatusConfirm(false)

    toast.success(`User ${newStatus === "active" ? "Activated" : "Deactivated"}`, {
      description: `${userToToggle.name} has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
    })
  }

  const getUserLevelBadge = (userlevel: string) => {
    switch (userlevel) {
      case "admin":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 text-white transition-all duration-200 hover:bg-red-600 w-full justify-center"
          >
            <ShieldAlert className="h-3 w-3" />
            Administrator
          </Badge>
        )
      case "manager":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-blue-500 text-white transition-all duration-200 hover:bg-blue-600 w-full justify-center"
          >
            <ShieldCheck className="h-3 w-3" />
            Manager
          </Badge>
        )
      case "inspector":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-white bg-green-500 transition-all duration-200 hover:bg-green-600 w-full justify-center"
          >
            <Activity className="h-3 w-3" />
            Inspector
          </Badge>
        )
      default:
        return null
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFilterLevel("all")
    setFilterStatus("all")
    setSortField("name")
    setSortDirection("asc")

    toast.info("Filters Reset", {
      description: "All search filters have been reset.",
    })
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    form.reset({
      name: user.name,
      id_number: user.id_number,
      email: user.email,
      userlevel: user.userlevel,
    })
    setIsAddUserOpen(true)
    setValidationError(null)
  }

  const toggleUserStatus = (user: User) => {
    setUserToToggle(user)
    setShowStatusConfirm(true)
  }

  const hasFormChanges = () => {
    if (!editingUser) return true

    const values = form.getValues()
    return (
      values.name !== editingUser.name ||
      values.id_number !== editingUser.id_number ||
      values.email !== editingUser.email ||
      values.userlevel !== editingUser.userlevel
    )
  }

  const handleCancelForm = () => {
    if (hasFormChanges()) {
      setShowCancelConfirm(true)
    } else {
      setIsAddUserOpen(false)
      setEditingUser(null)
      setValidationError(null)
    }
  }

  const confirmCancelForm = () => {
    setIsAddUserOpen(false)
    setEditingUser(null)
    setValidationError(null)
    setShowCancelConfirm(false)
  }

  const openActivitySheet = (user: User) => {
    setSelectedUserActivity(user)
    setActivitySheetOpen(true)
  }

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader 
          onSearch={(query) => setSearchTerm(query)}
          searchData={users.map(user => ({
            id: user.id,
            name: user.name,
            id_number: user.id_number,
            email: user.email
          }))}
        />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-2 pt-2 overflow-hidden">
              <Card className="flex flex-col h-full overflow-hidden border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight">User Management</CardTitle>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-2 items-center col-span-1 md:col-span-7">
                      <Select value={filterLevel} onValueChange={setFilterLevel}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                          <SelectValue placeholder="Filter by level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="inspector">Inspector</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" onClick={resetFilters} size="sm" className="w-full sm:w-auto">
                        Reset Filters
                      </Button>
                    </div>
                    
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setEditingUser(null)
                            form.reset({
                              name: "",
                              id_number: "",
                              email: "",
                              userlevel: "inspector",
                            })
                            setValidationError(null)
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                          <DialogDescription>
                            {editingUser
                              ? "Update user information and access level."
                              : "Fill in the details to create a new user."}
                          </DialogDescription>
                        </DialogHeader>

                        {validationError && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{validationError}</AlertDescription>
                          </Alert>
                        )}

                        {editingUser && (
                          <Alert className="mb-4 border-amber-300 bg-amber-50 text-amber-800">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertTitle>Editing User</AlertTitle>
                            <AlertDescription>You are updating information for user: {editingUser.name}</AlertDescription>
                          </Alert>
                        )}

                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="John Doe" 
                                      {...field} 
                                      ref={nameInputRef}
                                      className="focus-visible:ring-2 focus-visible:ring-green-500 border"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="id_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ID Number</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="12345678" 
                                      {...field} 
                                      className="focus-visible:ring-2 focus-visible:ring-green-500 border"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="user@emb.gov.ph" 
                                      {...field} 
                                      className="focus-visible:ring-2 focus-visible:ring-green-500 border"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="userlevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>User Level</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-green-500 border">
                                        <SelectValue placeholder="Select user level" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="admin">Administrator</SelectItem>
                                      <SelectItem value="manager">Manager</SelectItem>
                                      <SelectItem value="inspector">Inspector</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {!editingUser && (
                              <Alert>
                                <InfoIcon className="h-4 w-4" />
                                <AlertTitle>Default Password</AlertTitle>
                                <AlertDescription>
                                  A default password will be generated using the first 4 digits of the ID number followed
                                  by "@emb"
                                </AlertDescription>
                              </Alert>
                            )}
                            <DialogFooter className="gap-2">
                              <Button variant="outline" type="button" onClick={handleCancelForm}>
                                Cancel
                              </Button>
                              <Button type="submit">{editingUser ? "Update User" : "Add User"}</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 overflow-hidden">
                  <div className="rounded-md border flex-1 flex flex-col overflow-hidden">
                    <Table className="table-fixed">
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-3/12 text-left px-4 cursor-pointer" onClick={() => handleSort("name")}>
                            <div className="flex items-center">
                              Name
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-2/12 text-center px-4 cursor-pointer"
                            onClick={() => handleSort("id_number")}
                          >
                            <div className="flex items-center justify-center">
                              ID
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-3/12 text-left px-4 cursor-pointer hidden md:table-cell"
                            onClick={() => handleSort("email")}
                          >
                            <div className="flex items-center">
                              Email
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-2/12 text-center px-4 cursor-pointer"
                            onClick={() => handleSort("userlevel")}
                          >
                            <div className="flex items-center justify-center">
                              Role
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-2/12 text-left px-4 cursor-pointer hidden md:table-cell"
                            onClick={() => handleSort("createdAt")}
                          >
                            <div className="flex items-center">
                              Created
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-2/12 text-left px-4 cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center justify-center">
                              Status
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="w-1/12 text-right px-4">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>

                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-[calc(100vh-250px)] w-full">
                        <Table className="table-fixed">
                          <TableBody>
                            {processedUsers.map((user) => (
                              <TableRow 
                                  key={user.id} 
                                    className={cn(
                                      "hover:bg-green-50 dark:hover:bg-green-900/10 border-green-200 dark:border-green-800",
                                      isMatch(user) ?
                                      "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600" : ""
                                    )}
                                  >
                                <TableCell className="w-3/12 px-4 font-medium">{user.name}</TableCell>
                                <TableCell className="w-2/12 text-center px-4">{user.id_number}</TableCell>
                                <TableCell className="w-3/12 px-4 hidden md:table-cell">{user.email}</TableCell>
                                <TableCell className="w-2/12 px-4">
                                  <div className="flex justify-center">{getUserLevelBadge(user.userlevel)}</div>
                                </TableCell>
                                <TableCell className="w-2/12 px-4 hidden md:table-cell">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span>{format(user.createdAt, "MMM d, yyyy")}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="w-2/12 px-4">
                                  <div className="flex justify-center">
                                    <Badge
                                      variant={user.status === "active" ? "outline" : "secondary"}
                                      className={
                                        user.status === "active"
                                          ? "bg-green-100 text-green-800 hover:bg-green-300 w-20 flex items-center justify-center"
                                          : "bg-red-100 text-red-800 hover:bg-red-300 w-20 flex items-center justify-center"
                                      }
                                    >
                                      {user.status === "active" ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="w-1/12 text-right px-4">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                                        {user.status === "active" ? (
                                          <>
                                            <Ban className="mr-2 h-4 w-4 text-destructive" />
                                            <span className="text-destructive">Deactivate</span>
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                            <span className="text-green-500">Activate</span>
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openActivitySheet(user)}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        View Activity
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>

        {/* Confirmation Dialogs */}
        <Dialog open={showAddConfirm} onOpenChange={setShowAddConfirm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirm Add User</DialogTitle>
              <DialogDescription>
                Are you sure you want to add this new user? A default password will be generated.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAddUser}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirm User Changes</DialogTitle>
              <DialogDescription>Are you sure you want to update this user's information?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={confirmEditUser}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{userToToggle?.status === "active" ? "Deactivation" : "Activation"}</DialogTitle>
              <DialogDescription>
                {userToToggle?.status === "active"
                  ? "Are you sure you want to deactivate this user? They will lose access to the system."
                  : "Are you sure you want to activate this user? They will regain access to the system."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={confirmToggleStatus}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Discard Changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes. Are you sure you want to cancel? All changes will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(true)}>
                Continue Editing
              </Button>
              <Button onClick={confirmCancelForm}>Discard Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <Sheet open={activitySheetOpen} onOpenChange={setActivitySheetOpen}>
          <SheetContent className="w-full sm:max-w-md md:max-w-lg">
            <SheetHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    User Activity Log
                  </SheetTitle>
                  <SheetDescription className="mt-2">
                    {selectedUserActivity && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{selectedUserActivity.name}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="px-2 py-0.5 text-xs font-normal border-muted-foreground/30"
                          >
                            ID: {selectedUserActivity.id_number}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getUserLevelBadge(selectedUserActivity.userlevel)}
                          <Badge 
                            variant={selectedUserActivity.status === "active" ? "default" : "destructive"}
                            className="px-2 py-0.5 text-xs"
                          >
                            {selectedUserActivity.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </SheetDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 -mt-1 -mr-2"
                  onClick={() => setActivitySheetOpen(false)}
                >
                </Button>
              </div>
            </SheetHeader>

            <Separator className="my-3" />

            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="px-1 py-2 space-y-6">
                {activityGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="group">
                    {/* Date header */}
                    <div className="sticky top-0 z-10 flex items-center mb-3 bg-background/95 backdrop-blur">
                      <div className="h-px flex-1 bg-border" />
                      <span className="px-3 text-xs font-medium text-muted-foreground tracking-wider">
                        {group.date}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    
                    {/* Activities list */}
                    <div className="space-y-4 pl-4 border-l-2 border-muted-foreground/20">
                      {group.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="relative">
                          {/* Timeline dot */}
                          <div className={cn(
                            "absolute -left-[9px] top-3 h-3 w-3 rounded-full border-2 bg-background",
                            activity.type === "Login" ? "border-green-500" :
                            activity.type === "Profile Update" ? "border-blue-500" :
                            activity.type === "Password Change" ? "border-amber-500" :
                            "border-purple-500"
                          )} />
                          
                          <div className="ml-4 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium">
                                  {activity.type}
                                </h4>
                                {activity.important && (
                                  <Badge variant="destructive" className="px-1.5 py-0 text-xs">
                                    Important
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {activity.time}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            {activity.details && (
                              <div className="mt-1 p-2 text-xs rounded bg-muted/50">
                                {activity.details}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </SidebarProvider>
    </div>
  )
}
