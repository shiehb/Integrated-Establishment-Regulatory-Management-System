import { useState, useEffect, useRef, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/hooks/use-auth"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MoreHorizontal, Pencil, ShieldAlert, ShieldCheck, Activity, UserPlus, ArrowUpDown, Calendar, AlertCircle, Ban, CheckCircle, InfoIcon, User, FileDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import * as XLSX from 'xlsx'

type User = {
  id: string
  id_number: string
  password: string
  firstname: string
  lastname: string
  middlename: string
  email: string
  userlevel: "admin" | "manager" | "inspector"
  status: "active" | "inactive"
  created_at?: Date
  updated_at?: Date
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

const initialUsers: User[] = []

const activityGroups: ActivityGroup[] = [
  {
    date: "Yesterday, May 21, 2025",
    activities: [
      {
        type: "Password Change",
        time: "2:45 PM",
        description: "Password was changed",
        important: true,
      },
    ],
  },
]

const userFormSchema = z.object({
  firstname: z.string().min(2, "First name must be at least 2 characters"),
  lastname: z.string().min(2, "Last name must be at least 2 characters"),
  middlename: z.string().optional(),
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
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [adminPass, setAdminPass] = useState("")
  const [adminPassError, setAdminPassError] = useState("")
  const [showPasswordConfig, setShowPasswordConfig] = useState(false)
  const [passwordPattern, setPasswordPattern] = useState("@emb")
  const [isConfirmStep, setIsConfirmStep] = useState(false)
  const [tempPattern, setTempPattern] = useState("@emb")
  const [showExportConfirm, setShowExportConfirm] = useState(false)
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    id: true,
    email: true,
    role: true,
    status: true,
    createdDate: true
  })

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id_number: "",
      firstname: "",
      lastname: "",
      middlename: "",
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
  const fullName = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`.toLowerCase();
  return (
    fullName.includes(searchTerm.toLowerCase()) ||
    user.id_number.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.created_at && format(user.created_at, "MMM d, yyyy").toLowerCase().includes(searchTerm.toLowerCase()))
  );
};

const processedUsers = users
  .filter((u) => !(u.userlevel === "admin" && u.id_number === currentUser?.id_number))
  .filter((u) => {
    
    // Filter by search term
    if (searchTerm) {
      return isMatch(u);
    }

const matchesLevel = filterLevel === "all" ? true : u.userlevel === filterLevel;
    const matchesStatus = filterStatus === "all" ? true : u.status === filterStatus;
    return matchesLevel && matchesStatus;
  })
.sort((a, b) => {
    const aMatch = isMatch(a);
    const bMatch = isMatch(b);
    
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    
    let comparison = 0;
    switch (sortField) {
      case "name": {
        const aName = `${a.firstname} ${a.middlename ? a.middlename + ' ' : ''}${a.lastname}`.toLowerCase();
        const bName = `${b.firstname} ${b.middlename ? b.middlename + ' ' : ''}${b.lastname}`.toLowerCase();
        comparison = aName.localeCompare(bName);
        break;
      }
      case "id_number":
        comparison = a.id_number.localeCompare(b.id_number);
        break;
      case "email":
        comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        break;
      case "userlevel":
        comparison = a.userlevel.localeCompare(b.userlevel);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "createdAt":
        if (a.created_at && b.created_at) {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (a.created_at) {
          comparison = -1;
        } else if (b.created_at) {
          comparison = 1;
        }
        break;
      default:
        return 0;
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

  const resetAllStates = useCallback(() => {
    setShowResetDialog(false)
    setSelectedUser(null)
    setAdminPass("")
    setAdminPassError("")
  }, [])

  const handleCloseConfig = useCallback(() => {
    setShowPasswordConfig(false)
    setIsConfirmStep(false)
    setTempPattern(passwordPattern)
    setAdminPass("")
    setAdminPassError("")
  }, [passwordPattern])

  const handleDialogClose = useCallback((dialogStateSetter: (value: boolean) => void) => {
    dialogStateSetter(false)
    setTimeout(() => {
      if (dialogStateSetter === setShowResetDialog) {
        resetAllStates()
      } else if (dialogStateSetter === setShowPasswordConfig) {
        handleCloseConfig()
      }
    }, 100)
  }, [resetAllStates, handleCloseConfig])

  const handleAddNewClick = useCallback(() => {
    handleDialogClose(setIsAddUserOpen)
    setTimeout(() => {
      setIsAddUserOpen(true)
    }, 100)
  }, [handleDialogClose])

  const handleEditClick = useCallback((user: User) => {
    handleDialogClose(setIsAddUserOpen)
    setTimeout(() => {
      form.reset({
        firstname: user.firstname,
        lastname: user.lastname,
        middlename: user.middlename,
        id_number: user.id_number,
        email: user.email,
        userlevel: user.userlevel,
      })
      setEditingUser(user)
      setIsAddUserOpen(true)
    }, 100)
  }, [form, handleDialogClose])

  const handleEditUser = (user: User) => {
    handleEditClick(user)
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
        data.firstname === editingUser.firstname &&
        data.lastname === editingUser.lastname &&
        data.middlename === editingUser.middlename &&
        data.id_number === editingUser.id_number &&
        data.email === editingUser.email &&
        data.userlevel === editingUser.userlevel

      if (isUnchanged) {
        setIsAddUserOpen(false)
        setEditingUser(null)
        return
      }
      setFormData(data)
      setShowEditConfirm(true)
    } else {
      setFormData(data)
      setShowAddConfirm(true)
    }
  }

  const cleanupForm = () => {
    setIsAddUserOpen(false);
    setEditingUser(null);
    setValidationError(null);
    setFormData(null);
    setShowAddConfirm(false);
    setShowEditConfirm(false);
    form.reset({
      firstname: "",
      lastname: "",
      middlename: "",
      id_number: "",
      email: "",
      userlevel: "inspector"
    });
  };

  const confirmAddUser = () => {
    if (!formData) return;

    const defaultPassword = getDefaultPassword(formData.id_number);
    const newUser: User = {
      id: crypto.randomUUID(),
      firstname: formData.firstname,
      lastname: formData.lastname,
      middlename: formData.middlename || '',
      id_number: formData.id_number,
      email: formData.email,
      userlevel: formData.userlevel,
      status: "active",
      password: defaultPassword,
      created_at: new Date(),
    };

    // First update the users list
    setUsers(prev => [...prev, newUser]);
    
    // Then cleanup the form and close dialogs
    cleanupForm();

    // Finally show the success message
    toast.success("User Added", {

    });
  };

  const confirmEditUser = () => {
    if (!formData || !editingUser) return;

    // First update the users list
    setUsers(prev =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              firstname: formData.firstname,
              lastname: formData.lastname,
              middlename: formData.middlename || '',
              id_number: formData.id_number,
              email: formData.email,
              userlevel: formData.userlevel,
            }
          : u
      )
    );

    // Then cleanup the form and close dialogs
    cleanupForm();

    // Finally show the success message
    toast.success("User Updated", {
      description: `${formData.firstname} ${formData.middlename ? formData.middlename + ' ' : ''}${formData.lastname} has been updated successfully.`,
    });
  };

  const toggleUserStatus = (user: User) => {
    setUserToToggle(null)
    setTimeout(() => {
      setUserToToggle(user)
      setShowStatusConfirm(true)
    }, 100)
  }

  const confirmToggleStatus = () => {
    if (!userToToggle) return

    const newStatus = userToToggle.status === "active" ? "inactive" : "active"
    const userCopy = { ...userToToggle }

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
    handleDialogClose(setShowStatusConfirm)

    toast.success(`User ${newStatus === "active" ? "Activated" : "Deactivated"}`, {
      description: `${userCopy.firstname} ${userCopy.middlename ? userCopy.middlename + ' ' : ''}${userCopy.lastname} is now ${newStatus}.`,
    })
  }

  const openActivitySheet = (user: User) => {
    setSelectedUserActivity(null)
    setActivitySheetOpen(false)
    setTimeout(() => {
      setSelectedUserActivity(user)
      setActivitySheetOpen(true)
    }, 100)
  }

  const cleanupResetDialog = () => {
    setShowResetDialog(false);
    setSelectedUser(null);
    setAdminPass("");
    setAdminPassError("");
  };

  const handleResetPassword = (user: User) => {
    cleanupResetDialog();
    setTimeout(() => {
      setSelectedUser(user);
      setShowResetDialog(true);
    }, 0);
  };

  const handleResetConfirm = () => {
    if (!selectedUser || !adminPass.trim()) return;

    if (adminPass === "admin123") {
      const defaultPassword = getDefaultPassword(selectedUser.id_number);
      const userName = `${selectedUser.firstname} ${selectedUser.middlename ? selectedUser.middlename + ' ' : ''}${selectedUser.lastname}`;
      
      // Update user password
      setUsers(prev => 
        prev.map(u => u.id === selectedUser.id ? { ...u, password: defaultPassword } : u)
      );

      // Cleanup immediately
      cleanupResetDialog();

      // Show success message
      toast.success("Password Reset", {
        description: `Password for ${userName} has been reset to default (${defaultPassword}).`,
      });
    } else {
      setAdminPassError("Incorrect administrator password");
    }
  };

  const getDefaultPassword = (idNumber: string) => {
    return `${idNumber.substring(0, 4)}${passwordPattern}`
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
  setSearchTerm("");
  setFilterLevel("all");
  setFilterStatus("all");
  setSortField("name");
  setSortDirection("asc");

  toast.info("Filters Reset", {
    description: searchTerm 
      ? "Filters cleared for search results" 
      : "All search filters have been reset",
  });
};

  const hasFormChanges = () => {
    if (!editingUser) return true

    const values = form.getValues()
    return (
      values.firstname !== editingUser.firstname ||
      values.lastname !== editingUser.lastname ||
      values.middlename !== editingUser.middlename ||
      values.id_number !== editingUser.id_number ||
      values.email !== editingUser.email ||
      values.userlevel !== editingUser.userlevel
    )
  }

  const handleCancelForm = () => {
    if (hasFormChanges()) {
      setShowCancelConfirm(true);
    } else {
      cleanupForm();
    }
  };

  const confirmCancelForm = () => {
    cleanupForm();
    setShowCancelConfirm(false);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const userIds = processedUsers.map(user => user.id);
      setSelectedUsers(userIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => {
      if (checked) {
        return [...prev, userId];
      } else {
        return prev.filter(id => id !== userId);
      }
    });
  };

  const handleStartPasswordConfig = () => {
    setTempPattern(passwordPattern);
    setShowPasswordConfig(true);
    setIsConfirmStep(false);
    setAdminPass("");
    setAdminPassError("");
  }

  const handleProceedToConfirm = () => {
    setIsConfirmStep(true);
    setAdminPass("");
    setAdminPassError("");
  }

  const handleConfirmPattern = () => {
    if (adminPass === "admin123") {
      setPasswordPattern(tempPattern);
      setShowPasswordConfig(false);
      setIsConfirmStep(false);
      setAdminPass("");
      setAdminPassError("");
      
      toast.success("Pattern Updated", {
        description: `New default password pattern has been saved.`,
      });
    } else {
      setAdminPassError("Incorrect administrator password");
    }
  }

  const handleExportToExcel = () => {
    setSelectedFields({
      name: true,
      id: true,
      email: true,
      role: true,
      status: true,
      createdDate: true
    })
    setShowExportConfirm(true)
  }

  const confirmExport = () => {
    // Get selected users data
    const selectedUsersData = users.filter(user => selectedUsers.includes(user.id))
    
    // Create export data based on selected fields
    const exportData = selectedUsersData.map(user => {
      const data: Record<string, string> = {}
      
      if (selectedFields.name) {
        data['Name'] = `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`
      }
      if (selectedFields.id) data['ID'] = user.id_number
      if (selectedFields.email) data['Email'] = user.email
      if (selectedFields.role) data['Role'] = user.userlevel.charAt(0).toUpperCase() + user.userlevel.slice(1)
      if (selectedFields.status) data['Status'] = user.status.charAt(0).toUpperCase() + user.status.slice(1)
      if (selectedFields.createdDate && user.created_at) {
        data['Created Date'] = format(user.created_at, "yyyy-MM-dd")
      }
      return data
    })

    try {
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Set column widths based on selected fields
      const colWidths: Array<{ wch: number }> = []
      if (selectedFields.name) colWidths.push({ wch: 20 })
      if (selectedFields.id) colWidths.push({ wch: 15 })
      if (selectedFields.email) colWidths.push({ wch: 30 })
      if (selectedFields.role) colWidths.push({ wch: 15 })
      if (selectedFields.status) colWidths.push({ wch: 10 })
      if (selectedFields.createdDate) colWidths.push({ wch: 15 })
      
      ws['!cols'] = colWidths

      // Create workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Users")

      // Generate filename with current date
      const dateStr = format(new Date(), "yyyy-MM-dd")
      const filename = `users_export_${dateStr}.xlsx`

      // Save file
      XLSX.writeFile(wb, filename)

      // Close dialog and show success message
      setShowExportConfirm(false)
      toast.success("Export Successful", {
        description: `${selectedUsers.length} user${selectedUsers.length === 1 ? '' : 's'} exported to Excel.`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast.error("Export Failed", {
        description: "There was an error exporting the data. Please try again.",
      })
    }
  }

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader 
          onSearch={(query) => {
            
            setSearchTerm(query);
            // Reset filters when searching
            if (query.trim()) {
              setFilterLevel("all");
              setFilterStatus("all");
            }
          }}
          searchData={users.map(user => ({
            id: user.id,
            name: `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`,
            id_number: user.id_number,
            email: user.email
          }))}
        />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-2 pt-4 overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                          User Management
                        </CardTitle>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-3">
                        {selectedUsers.length > 0 && (
                          <Button
                            variant="outline"
                            onClick={handleExportToExcel}
                            className="w-full sm:w-auto"
                          >
                            <FileDown className="mr-2 h-4 w-4" />
                            Export Selected ({selectedUsers.length})
                          </Button>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <div className="grid grid-cols-2 gap-2">
                            <Select value={filterLevel} onValueChange={setFilterLevel}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">User Level</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="inspector">Inspector</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="w-full sm:w-auto"
                          >
                            Reset Filters
                          </Button>

                          <Button
                            variant="outline"
                            onClick={handleStartPasswordConfig}
                            className="w-full sm:w-auto"
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Configure Default Password
                          </Button>
                        </div>

                        <Dialog 
                          open={isAddUserOpen} 
                          onOpenChange={(open) => {
                            if (!open) {
                              cleanupForm();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="w-full sm:w-auto"
                              onClick={handleAddNewClick}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add User
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="sm:max-w-[500px]"
                            aria-describedby="add-user-description"
                          >
                            <DialogHeader>
                              <DialogTitle>
                                {editingUser ? "Edit User" : "Add New User"}
                              </DialogTitle>
                              <DialogDescription id="add-user-description">
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
                                <AlertDescription>
                                  You are updating information for user: {editingUser.firstname} {editingUser.middlename ? editingUser.middlename + ' ' : ''}{editingUser.lastname}
                                </AlertDescription>
                              </Alert>
                            )}

                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                              >
                                <FormField
                                  control={form.control}
                                  name="firstname"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>First Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="John"
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
                                  name="middlename"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Middle Name (Optional)</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Michael"
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
                                  name="lastname"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Last Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Doe"
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
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
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
                                      A default password will be generated using the first 4
                                      digits of the ID number followed by "@emb"
                                    </AlertDescription>
                                  </Alert>
                                )}
                                <DialogFooter className="gap-2">
                                  <Button
                                    variant="outline"
                                    type="button"
                                    onClick={handleCancelForm}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit">
                                    {editingUser ? "Update User" : "Add User"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 overflow-hidden">
                  <div className="rounded-md border flex-1 flex flex-col overflow-hidden">
                    <Table className="table-fixed">
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-[50px] px-4 text-left">
                            <Checkbox 
                              checked={
                                processedUsers.length > 0 && selectedUsers.length === processedUsers.length
                              }
                              onCheckedChange={toggleSelectAll}
                              aria-label="Select all"
                              className="translate-y-[2px]"
                            />
                          </TableHead>
                          <TableHead className="min-w-[200px] w-[25%] px-4 text-left cursor-pointer" onClick={() => handleSort("name")}>
                            <div className="flex items-center">
                              Name
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-[120px] px-4 text-left cursor-pointer"
                            onClick={() => handleSort("id_number")}
                          >
                            <div className="flex items-center">
                              ID
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="min-w-[200px] w-[25%] px-4 text-left cursor-pointer hidden md:table-cell"
                            onClick={() => handleSort("email")}
                          >
                            <div className="flex items-center">
                              Email
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-[140px] px-4 text-center cursor-pointer"
                            onClick={() => handleSort("userlevel")}
                          >
                            <div className="flex items-center justify-center">
                              Role
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-[140px] px-4 text-left cursor-pointer hidden md:table-cell"
                            onClick={() => handleSort("createdAt")}
                          >
                            <div className="flex items-center">
                              Created
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="w-[100px] px-4 text-center cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center justify-center">
                              Status
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="w-[60px] px-4 text-right">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>

                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)] lg:h-[calc(100vh-12rem)] w-full">
                        <Table className="table-fixed">
                          <TableBody>
                            {processedUsers.map((user) => (
                              <TableRow 
                                key={user.id} 
                                className={cn(
                                  "hover:bg-green-100 dark:hover:bg-green-900/10 border-green-900 dark:border-green-800",
                                  isMatch(user) ?
                                  "bg-yellow-100 dark:bg-yellow-900/20 border border-green-500 dark:border-yellow-600" : "",
                                  selectedUsers.includes(user.id) && 
                                  "bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-600"
                                )}
                              >
                                <TableCell className="w-[50px] px-4">
                                  <Checkbox 
                                    checked={selectedUsers.includes(user.id)}
                                    onCheckedChange={(checked) => toggleUserSelection(user.id, checked as boolean)}
                                    aria-label={`Select ${`${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`}`}
                                    className="translate-y-[2px]"
                                  />
                                </TableCell>
                                <TableCell className="min-w-[200px] w-[25%] px-4 font-medium truncate">{`${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`}</TableCell>
                                <TableCell className="w-[120px] px-4 text-left">{user.id_number}</TableCell>
                                <TableCell className="min-w-[200px] w-[25%] px-4 hidden md:table-cell truncate">{user.email}</TableCell>
                                <TableCell className="w-[140px] px-4">
                                  <div className="flex justify-center">{getUserLevelBadge(user.userlevel)}</div>
                                </TableCell>
                                <TableCell className="w-[140px] px-4 hidden md:table-cell">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {user.created_at ? format(user.created_at, "yyyy-MM-dd") : "N/A"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="w-[100px] px-4">
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
                                <TableCell className="w-[60px] px-4 text-right">
                                  <DropdownMenu modal={true}>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="focus-visible:ring-2 focus-visible:ring-offset-2"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent 
                                      align="end"
                                      side="right"
                                      sideOffset={5}
                                      className="w-48"
                                      onCloseAutoFocus={(event) => event.preventDefault()}
                                    >
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem 
                                        onSelect={() => handleEditUser(user)}
                                        className="cursor-pointer"
                                      >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onSelect={() => toggleUserStatus(user)}
                                        className="cursor-pointer"
                                      >
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
                                      <DropdownMenuItem 
                                        onSelect={() => openActivitySheet(user)}
                                        className="cursor-pointer"
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        View Activity
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onSelect={() => handleResetPassword(user)}
                                        className="cursor-pointer"
                                      >
                                        <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                                        <span className="text-blue-500">Reset Password</span>
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
            </div>
          </SidebarInset>
        </div>

        <Dialog open={showAddConfirm} onOpenChange={setShowAddConfirm}>
          <DialogContent
            className="sm:max-w-[500px]"
            aria-describedby="add-confirm-description"
          >
            <DialogHeader>
              <DialogTitle>Confirm Add User</DialogTitle>
              <DialogDescription id="add-confirm-description">
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
          <DialogContent
            className="sm:max-w-[500px]"
            aria-describedby="edit-confirm-description"
          >
            <DialogHeader>
              <DialogTitle>Confirm User Changes</DialogTitle>
              <DialogDescription id="edit-confirm-description">
                Please review the changes before confirming.
              </DialogDescription>
            </DialogHeader>

            {editingUser && formData && (
              <div className="space-y-4 mt-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Review Changes</AlertTitle>
                  <AlertDescription>
                    Please review the following changes for user: {editingUser.firstname} {editingUser.middlename ? editingUser.middlename + ' ' : ''}{editingUser.lastname}
                  </AlertDescription>
                </Alert>
                
                {editingUser.firstname !== formData.firstname && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">First Name:</span>
                    <span className="line-through text-muted-foreground">{editingUser.firstname}</span>
                    <span className="text-green-600">→</span>
                    <span className="text-green-600">{formData.firstname}</span>
                  </div>
                )}
                {editingUser.middlename !== formData.middlename && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Middle Name:</span>
                    <span className="line-through text-muted-foreground">{editingUser.middlename}</span>
                    <span className="text-green-600">→</span>
                    <span className="text-green-600">{formData.middlename}</span>
                  </div>
                )}
                {editingUser.lastname !== formData.lastname && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Last Name:</span>
                    <span className="line-through text-muted-foreground">{editingUser.lastname}</span>
                    <span className="text-green-600">→</span>
                    <span className="text-green-600">{formData.lastname}</span>
                  </div>
                )}
                {editingUser.id_number !== formData.id_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">ID Number:</span>
                    <span className="line-through text-muted-foreground">{editingUser.id_number}</span>
                    <span className="text-green-600">→</span>
                    <span className="text-green-600">{formData.id_number}</span>
                  </div>
                )}
                
                {editingUser.email !== formData.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Email:</span>
                    <span className="line-through text-muted-foreground">{editingUser.email}</span>
                    <span className="text-green-600">→</span>
                    <span className="text-green-600">{formData.email}</span>
                  </div>
                )}
                
                {editingUser.userlevel !== formData.userlevel && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">User Level:</span>
                    <span className="line-through text-muted-foreground capitalize">{editingUser.userlevel}</span>
                    <span className="text-green-600">→</span>
                    <span className="text-green-600 capitalize">{formData.userlevel}</span>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEditConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={confirmEditUser}>
                Confirm Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog 
          open={showStatusConfirm}
          onOpenChange={(open) => {
            if (!open) {
              handleDialogClose(setShowStatusConfirm);
            }
          }}
        >
          <DialogContent
            className="sm:max-w-[500px]"
            aria-describedby="status-confirm-description"
          >
            <DialogHeader>
              <DialogTitle>{userToToggle?.status === "active" ? "Deactivation" : "Activation"}</DialogTitle>
              <DialogDescription id="status-confirm-description">
                {userToToggle?.status === "active"
                  ? "Are you sure you want to deactivate this user? They will lose access to the system."
                  : "Are you sure you want to activate this user? They will regain access to the system."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(setShowStatusConfirm)}>
                Cancel
              </Button>
              <Button onClick={confirmToggleStatus}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <DialogContent
            className="sm:max-w-[500px]"
            aria-describedby="cancel-confirm-description"
          >
            <DialogHeader>
              <DialogTitle>Discard Changes</DialogTitle>
              <DialogDescription id="cancel-confirm-description">
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

        <Dialog 
          open={showResetDialog}
          onOpenChange={(open) => !open && cleanupResetDialog()}
        >
          <DialogContent
            aria-describedby="reset-password-description"
          >
            {selectedUser && (
              <>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription id="reset-password-description">
                    Are you sure you want to reset the password for {selectedUser.firstname} {selectedUser.middlename ? selectedUser.middlename + ' ' : ''}{selectedUser.lastname}? 
                    This will set their password to the default pattern based on their ID number.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      This will reset the user's password to the default pattern. They will need to change it upon next login.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-lg border bg-card p-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        
                        <span className="font-medium">
                          {selectedUser.firstname} {selectedUser.middlename ? selectedUser.middlename + ' ' : ''}{selectedUser.lastname}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">New Password Will Be:</div>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          {getDefaultPassword(selectedUser.id_number)}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Administrator Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPass}
                      onChange={(e) => {
                        setAdminPass(e.target.value);
                        setAdminPassError("");
                      }}
                      placeholder="Enter administrator password"
                    />
                    {adminPassError && (
                      <p className="text-sm text-destructive">{adminPassError}</p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={cleanupResetDialog}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleResetConfirm}
                    disabled={!adminPass.trim()}
                  >
                    Reset Password
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Sheet 
          open={activitySheetOpen} 
          onOpenChange={(open) => {
            if (!open) {
              handleDialogClose(setActivitySheetOpen)
              setSelectedUserActivity(null)
            }
          }}
        >
          <SheetContent className="w-full sm:max-w-md md:max-w-lg">
            <SheetHeader className="space-y-4">
              {selectedUserActivity && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <SheetTitle className="text-2xl font-semibold">
                        Activity Log
                      </SheetTitle>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">
                            {selectedUserActivity.firstname} {selectedUserActivity.middlename ? selectedUserActivity.middlename + ' ' : ''}{selectedUserActivity.lastname}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedUserActivity.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge 
                        variant="outline" 
                        className="px-2 py-1 text-xs font-normal border-muted-foreground/30"
                      >
                        ID: {selectedUserActivity.id_number}
                      </Badge>
                      <div className="flex flex-col gap-1.5">
                        {getUserLevelBadge(selectedUserActivity.userlevel)}
                        <Badge 
                          variant={selectedUserActivity.status === "active" ? "default" : "destructive"}
                          className="w-full justify-center"
                        >
                          {selectedUserActivity.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-4 space-y-3">
                      <h4 className="font-medium leading-none flex items-center gap-2">
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        Account Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">
                            {selectedUserActivity.created_at 
                              ? format(selectedUserActivity.created_at, "yyyy-MM-dd") 
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Activity</p>
                          <p className="font-medium">Today, 2:30 PM</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Logins</p>
                          <p className="font-medium">24</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Login</p>
                          <p className="font-medium">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SheetHeader>

            <Separator className="my-4" />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Activity Timeline</span>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-380px)] mt-6">
              <div className="space-y-8 pr-4 pb-8">
                {activityGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-6">
                    <h4 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur z-10 py-2 -mx-6 px-6">
                      {group.date}
                    </h4>
                    
                    <div className="space-y-6 px-1">
                      {group.activities.map((activity, activityIndex) => (
                        <div 
                          key={activityIndex} 
                          className={cn(
                            "rounded-lg border bg-card text-card-foreground shadow-sm",
                            activity.important && "border-destructive/50 bg-destructive/5"
                          )}
                        >
                          <div className="p-5 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "h-9 w-9 rounded-full flex items-center justify-center",
                                  activity.type === "Login" ? "bg-green-100 text-green-700" :
                                  activity.type === "Profile Update" ? "bg-blue-100 text-blue-700" :
                                  activity.type === "Password Change" ? "bg-amber-100 text-amber-700" :
                                  "bg-purple-100 text-purple-700"
                                )}>
                                  {activity.type === "Login" && <User className="h-4 w-4" />}
                                  {activity.type === "Profile Update" && <Pencil className="h-4 w-4" />}
                                  {activity.type === "Password Change" && <ShieldCheck className="h-4 w-4" />}
                                  {activity.type === "System Access" && <Activity className="h-4 w-4" />}
                                </div>
                                <div>
                                  <p className="font-medium leading-none">{activity.type}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                                </div>
                              </div>
                              {activity.important && (
                                <Badge variant="destructive" className="ml-2">Important</Badge>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed">{activity.description}</p>
                            {activity.details && (
                              <div className="text-sm bg-muted/50 rounded-md p-4 font-mono">
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

        <Dialog 
          open={showPasswordConfig}
          onOpenChange={(open) => {
            if (!open) handleDialogClose(setShowPasswordConfig);
          }}
        >
          <DialogContent
            className="sm:max-w-[500px]"
            aria-describedby="password-config-description"
          >
            <DialogHeader>
              <DialogTitle>Configure Default Password Pattern</DialogTitle>
              <DialogDescription id="password-config-description">
                Set the pattern for default passwords. This will be used when creating new users or resetting individual passwords.
              </DialogDescription>
            </DialogHeader>

            {!isConfirmStep ? (
              <div className="space-y-6 py-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Current Pattern</AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="space-y-2">
                      <p>Default password format: <span className="font-mono bg-muted px-2 py-1 rounded">1234{tempPattern}</span></p>
                      <p className="text-sm text-muted-foreground">Where "1234" represents the first 4 digits of the user's ID</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="passwordPattern">Password Pattern</Label>
                  <div className="flex gap-2">
                    <Input
                      id="passwordPattern"
                      value={tempPattern}
                      onChange={(e) => setTempPattern(e.target.value)}
                      placeholder="@emb"
                      className="font-mono"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Example: For ID "12345678" and pattern "{tempPattern}", 
                    the default password will be: <span className="font-mono bg-muted px-1">1234{tempPattern}</span>
                  </p>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>When is this used?</AlertTitle>
                  <AlertDescription className="space-y-2 mt-2">
                    <p>This pattern will be used in two cases:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>When creating new users</li>
                      <li>When resetting an individual user's password</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">Existing user passwords will not be affected until their password is reset.</p>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Check</AlertTitle>
                  <AlertDescription>
                    This action requires administrator verification to proceed.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Pattern Preview</Label>
                    <div className="p-2 bg-muted rounded-md font-mono text-sm">
                      Example: 1234{tempPattern}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Administrator Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPass}
                      onChange={(e) => {
                        setAdminPass(e.target.value);
                        setAdminPassError("");
                      }}
                      placeholder="Enter your password"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && adminPass.trim()) {
                          e.preventDefault();
                          handleConfirmPattern();
                        }
                      }}
                    />
                    {adminPassError && (
                      <p className="text-sm text-destructive">{adminPassError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (isConfirmStep) {
                    setIsConfirmStep(false);
                    setAdminPass("");
                    setAdminPassError("");
                  } else {
                    handleDialogClose(setShowPasswordConfig);
                  }
                }}
              >
                {isConfirmStep ? "Back" : "Cancel"}
              </Button>
              <Button 
                onClick={isConfirmStep ? handleConfirmPattern : handleProceedToConfirm}
                disabled={isConfirmStep ? !adminPass.trim() : !tempPattern.trim()}
              >
                {isConfirmStep ? "Confirm Change" : "Continue"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showExportConfirm} onOpenChange={setShowExportConfirm}>
          <DialogContent
            className="sm:max-w-[500px]"
            aria-describedby="export-confirm-description"
          >
            <DialogHeader>
              <DialogTitle>Export Selected Users</DialogTitle>
              <DialogDescription id="export-confirm-description">
                Select the fields you want to export for {selectedUsers.length} selected user{selectedUsers.length === 1 ? '' : 's'}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Export Details</AlertTitle>
                <AlertDescription>
                  Choose which information to include in the export:
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="name" 
                      checked={selectedFields.name}
                      onCheckedChange={(checked) => 
                        setSelectedFields(prev => ({ ...prev, name: checked as boolean }))
                      }
                    />
                    <Label htmlFor="name">Name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="id" 
                      checked={selectedFields.id}
                      onCheckedChange={(checked) => 
                        setSelectedFields(prev => ({ ...prev, id: checked as boolean }))
                      }
                    />
                    <Label htmlFor="id">ID Number</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="email" 
                      checked={selectedFields.email}
                      onCheckedChange={(checked) => 
                        setSelectedFields(prev => ({ ...prev, email: checked as boolean }))
                      }
                    />
                    <Label htmlFor="email">Email</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="role" 
                      checked={selectedFields.role}
                      onCheckedChange={(checked) => 
                        setSelectedFields(prev => ({ ...prev, role: checked as boolean }))
                      }
                    />
                    <Label htmlFor="role">Role</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="status" 
                      checked={selectedFields.status}
                      onCheckedChange={(checked) => 
                        setSelectedFields(prev => ({ ...prev, status: checked as boolean }))
                      }
                    />
                    <Label htmlFor="status">Status</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="createdDate" 
                      checked={selectedFields.createdDate}
                      onCheckedChange={(checked) => 
                        setSelectedFields(prev => ({ ...prev, createdDate: checked as boolean }))
                      }
                    />
                    <Label htmlFor="createdDate">Created Date</Label>
                  </div>
                </div>
              </div>

              <Alert variant="destructive" className={cn(
                "transition-all",
                Object.values(selectedFields).every(v => !v) ? "opacity-100" : "opacity-0 hidden"
              )}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select at least one field to export.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportConfirm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmExport}
                disabled={Object.values(selectedFields).every(v => !v)}
              >
                Export to Excel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </div>
  )
}
