"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/hooks/use-auth"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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
  Search,
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
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"

// Define the user type
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

// Sample users data with creation dates
const initialUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    id_number: "12345678",
    email: "admin@emb.gov.ph",
    userlevel: "admin",
    status: "active",
    createdAt: new Date(2023, 0, 15),
  },
  {
    id: "2",
    name: "Manager User",
    id_number: "87654321",
    email: "manager@emb.gov.ph",
    userlevel: "manager",
    status: "active",
    createdAt: new Date(2023, 1, 20),
  },
  {
    id: "3",
    name: "Inspector User",
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
]

// Form schema for adding/editing users with validation for duplicates
const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  id_number: z.string().min(8, "ID Number must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
  userlevel: z.enum(["admin", "manager", "inspector"]),
})

type SortField = "name" | "id_number" | "email" | "userlevel" | "status" | "createdAt"
type SortDirection = "asc" | "desc"

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Initialize form
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      id_number: "",
      email: "",
      userlevel: "inspector",
    },
  })

  // Filter and sort users
  const processedUsers = users
    // Filter out the current admin user
    .filter((u) => !(u.userlevel === "admin" && u.id_number === user?.id_number))
    // Apply search filter
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id_number.includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    // Apply user level filter
    .filter((u) => (filterLevel === "all" ? true : u.userlevel === filterLevel))
    // Apply status filter
    .filter((u) => (filterStatus === "all" ? true : u.status === filterStatus))
    // Sort users
    .sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "id_number":
          comparison = a.id_number.localeCompare(b.id_number)
          break
        case "email":
          comparison = a.email.localeCompare(b.email)
          break
        case "userlevel":
          comparison = a.userlevel.localeCompare(b.userlevel)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
        case "createdAt":
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        default:
          comparison = 0
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle form submission for adding/editing users
  const onSubmit = (data: z.infer<typeof userFormSchema>) => {
    // Check for duplicate ID number and email
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
      // Update existing user
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: data.name,
                id_number: data.id_number,
                email: data.email,
                userlevel: data.userlevel,
                // Don't change status when editing
              }
            : u,
        ),
      )
    } else {
      // Add new user with default password and active status
      const defaultPassword = `${data.id_number.substring(0, 4)}@emb` // Create a default password using first 4 digits of ID + @emb
      const newUser: User = {
        id: crypto.randomUUID(), // Generate a truly unique ID
        name: data.name,
        id_number: data.id_number,
        email: data.email,
        userlevel: data.userlevel,
        status: "active", // Always set new users to active
        createdAt: new Date(), // Set creation date to now
        password: defaultPassword, // Store the default password (in a real app, this would be hashed)
      }
      setUsers([...users, newUser])
    }

    // Reset form and close dialog
    form.reset()
    setIsAddUserOpen(false)
    setEditingUser(null)
    setValidationError(null)
  }

  // Handle edit user
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

  // Get user level badge
  const getUserLevelBadge = (userlevel: string) => {
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

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setFilterLevel("all")
    setFilterStatus("all")
    setSortField("name")
    setSortDirection("asc")
  }

  // Add a function to handle user activation/deactivation
  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: u.status === "active" ? "inactive" : "active",
            }
          : u,
      ),
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>User Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">User Management</CardTitle>
                  <CardDescription>Manage system users and their access levels.</CardDescription>
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

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
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
                                <Input placeholder="12345678" {...field} />
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
                                <Input placeholder="user@emb.gov.ph" {...field} />
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
                                  <SelectTrigger>
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
                              A default password will be generated using the first 4 digits of the ID number followed by
                              "@emb"
                            </AlertDescription>
                          </Alert>
                        )}
                        <DialogFooter>
                          <Button type="submit">{editingUser ? "Update User" : "Add User"}</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="w-[180px]">
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
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={resetFilters} size="sm">
                      Reset Filters
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {processedUsers.length} of {users.length - (user?.userlevel === "admin" ? 1 : 0)} users
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                        <div className="flex items-center">
                          Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("id_number")}>
                        <div className="flex items-center">
                          ID Number
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                        <div className="flex items-center">
                          Email
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("userlevel")}>
                        <div className="flex items-center">
                          User Level
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                        <div className="flex items-center">
                          Created On
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      processedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.id_number}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getUserLevelBadge(user.userlevel)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={user.status === "active" ? "outline" : "secondary"}
                              className={
                                user.status === "active"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }
                            >
                              {user.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{format(user.createdAt, "MMM d, yyyy")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
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
                                <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
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
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  View Activity
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
