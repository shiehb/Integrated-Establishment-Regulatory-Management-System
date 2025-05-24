
"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { AppSidebar } from "../../components/app-sidebar"
import { useAuth } from "../../hooks/use-auth"
import { SiteHeader } from "../../components/site-header"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
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
  User,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { toast } from "sonner"
import { useIsMobile } from "../../hooks/use-mobile"
import { Sheet, SheetContent } from "../../components/ui/sheet"
import { format } from "date-fns"
import { cn } from "../../lib/utils"

// Define types and initial data here (assuming they are defined elsewhere or to be added)

type User = {
  id: string
  name: string
  id_number: string
  email: string
  userlevel: string
  status: string
  createdAt: Date
  password?: string
}

type SortField = "name" | "id_number" | "email" | "userlevel" | "status" | "createdAt"
type SortDirection = "asc" | "desc"

const initialUsers: User[] = [] // Placeholder, replace with actual initial data if any

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  id_number: z.string().min(1, "ID Number is required"),
  email: z.string().email("Invalid email address"),
  userlevel: z.enum(["admin", "manager", "inspector"]),
})

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const isMobile = useIsMobile()
  const [isLoading, setIsLoading] = useState(false)
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

  const isMatch = useCallback((user: User) => {
    if (!searchTerm) return false
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id_number.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(user.createdAt, "MMM d, yyyy").toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const processedUsers = useMemo(() => {
    return users
      .filter((u) => !(u.userlevel === "admin" && u.id_number === currentUser?.id_number))
      .filter((u) => (filterLevel === "all" ? true : u.userlevel === filterLevel))
      .filter((u) => (filterStatus === "all" ? true : u.status === filterStatus))
      .sort((a, b) => {
        const aMatch = isMatch(a)
        const bMatch = isMatch(b)

        if (aMatch && !bMatch) return -1
        if (!aMatch && bMatch) return 1

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
  }, [users, currentUser, filterLevel, filterStatus, sortField, sortDirection, isMatch])

  const handleSort = useCallback((field: SortField) => {
    if (isLoading) return
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }, [isLoading, sortField, sortDirection])

  const onSubmit = useCallback(async (data: z.infer<typeof userFormSchema>) => {
    if (isLoading) return
    setIsLoading(true)
    try {
      // Validation checks
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
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, editingUser, users])

  const confirmAddUser = useCallback(async () => {
    if (!formData || isLoading) return
    setIsLoading(true)
    try {
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
      setUsers(prev => [...prev, newUser])
      form.reset()
      setIsAddUserOpen(false)
      setFormData(null)
      setShowAddConfirm(false)
      toast.success("User Added", {
        description: `${newUser.name} has been added successfully.`,
      })
    } finally {
      setIsLoading(false)
    }
  }, [formData, isLoading, form])

  const handleEditUser = useCallback(async (user: User) => {
    if (isLoading) return
    setIsLoading(true)
    try {
      setEditingUser(user)
      form.reset({
        name: user.name,
        id_number: user.id_number,
        email: user.email,
        userlevel: user.userlevel,
      })
      setIsAddUserOpen(true)
      setValidationError(null)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, form])

  const toggleUserStatus = useCallback((user: User) => {
    if (isLoading) return
    setUserToToggle(user)
    setShowStatusConfirm(true)
  }, [isLoading])

  const openActivitySheet = useCallback((user: User) => {
    if (isLoading) return
    setSelectedUserActivity(user)
    setActivitySheetOpen(true)
  }, [isLoading])

  const getUserLevelBadge = useCallback((userlevel: string) => {
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
  }, [])

  const resetFilters = useCallback(() => {
    if (isLoading) return
    setFilterLevel("all")
    setFilterStatus("all")
  }, [isLoading])

  const handleCancelForm = useCallback(() => {
    if (isLoading) return
    setShowCancelConfirm(true)
  }, [isLoading])

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader 
          onSearch={(query) => !isLoading && setSearchTerm(query)}
          searchData={users.map(user => ({
            id: user.id,
            name: user.name,
            id_number: user.id_number,
            email: user.email
          }))}
          isMobile={isMobile}
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
