"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppSidebar } from "@/components/app-sidebar"
import { useAvatar } from "@/hooks/use-avatar"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"
import { AlertCircle, Check, Info, Mail, BadgeIcon as IdCard } from "lucide-react"
import { SiteHeader } from "@/components/site-header"

// Form schema for profile picture
const profilePictureSchema = z.object({
  avatar: z.string().optional(),
})

// Form schema for password change
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function ProfileEditPage() {
  const { navigate } = useSafeNavigation()
  const { avatarUrl, updateAvatar } = useAvatar()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Initialize profile picture form
  const profilePictureForm = useForm<z.infer<typeof profilePictureSchema>>({
    resolver: zodResolver(profilePictureSchema),
    defaultValues: {
      avatar: "",
    },
  })

  // Initialize password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Handle file selection and preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setProfileError("Please select an image file")
        return
      }
      
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        setProfileError("Image size should be less than 2MB")
        return
      }

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)
      
      // Update form value
      profilePictureForm.setValue('avatar', e.target.value)
    }
  }

  // Handle profile picture form submission
  const onProfilePictureSubmit = async () => {
    setIsSubmitting(true)
    setProfileError(null)
    setProfileSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      if (previewImage) {
        // Update the global avatar state
        updateAvatar(previewImage)
        setProfileSuccess(true)
      }
    } catch {
      setProfileError("Failed to update profile picture. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle password form submission
  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsSubmitting(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Password update data:", data)
      setPasswordSuccess(true)
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch {
      setPasswordError("Failed to update password. Please try again.")
    } finally {
      setIsSubmitting(false)
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
            <div className="container mx-auto max-w-7xl p-4 pt-0">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
                <p className="text-muted-foreground">Update your profile picture and password.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mt-6">
                {/* Profile Information Card */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture Section */}
                    <Form {...profilePictureForm}>
                      <form onSubmit={profilePictureForm.handleSubmit(onProfilePictureSubmit)} className="space-y-6">
                        <div className="flex flex-col items-center">
                          <Avatar className="h-24 w-24 mb-6">
                            {(previewImage || avatarUrl) ? (
                              <AvatarImage 
                                src={previewImage || avatarUrl || undefined} 
                                alt={user.name}
                              />
                            ) : (
                              <AvatarFallback className="text-2xl">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <FormField
                            control={profilePictureForm.control}
                            name="avatar"
                            render={({ field: { onChange, ...field } }) => (
                              <FormItem className="w-full">
                                <FormControl>
                                  <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      onChange(e.target.value)
                                      handleFileSelect(e)
                                    }}
                                    className="cursor-pointer file:cursor-pointer"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-center">
                                  Upload a new profile picture (JPG or PNG, max 2MB)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {profileError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{profileError}</AlertDescription>
                          </Alert>
                        )}

                        {profileSuccess && (
                          <Alert className="bg-green-50 text-green-800 border-green-200">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertDescription>Profile picture updated successfully!</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={isSubmitting || !profilePictureForm.getValues('avatar')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Update Picture
                          </Button>
                        </div>
                      </form>
                    </Form>

                    {/* Read-only Information */}
                    <div className="space-y-4 pt-6 border-t">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p>{user.name}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-muted-foreground" />
                          <label className="text-sm font-medium text-muted-foreground">ID Number</label>
                        </div>
                        <p>{user.id_number}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                        </div>
                        <p>{user.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormDescription>Password must be at least 6 characters long</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Alert variant="default" className="bg-slate-50">
                          <Info className="h-4 w-4" />
                          <AlertTitle>Password Security</AlertTitle>
                          <AlertDescription>
                            For better security, use a mix of letters, numbers, and special characters.
                          </AlertDescription>
                        </Alert>

                        {passwordError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{passwordError}</AlertDescription>
                          </Alert>
                        )}

                        {passwordSuccess && (
                          <Alert className="bg-green-50 text-green-800 border-green-200">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertDescription>Password changed successfully!</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            type="button" 
                            onClick={() => navigate("/profile")}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Change Password
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
