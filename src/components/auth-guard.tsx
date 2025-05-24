"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredLevel?: "admin" | "manager" | "inspector" | "any"
}

export function AuthGuard({ children, requiredLevel = "any" }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const { navigate } = useSafeNavigation()
  const [shouldRender, setShouldRender] = useState(false)

  // Check if user has the required level
  const hasRequiredLevel = (userLevel: string, requiredLevel: string): boolean => {
    if (requiredLevel === "any") return true
    if (requiredLevel === "admin") return userLevel === "admin"
    if (requiredLevel === "manager") return ["admin", "manager"].includes(userLevel)
    if (requiredLevel === "inspector") return ["admin", "manager", "inspector"].includes(userLevel)
    return false
  }

  // Use a separate effect for the redirect logic
  useEffect(() => {
    let mounted = true

    // Only check after initial loading is complete
    if (!isLoading) {
      if (!user) {
        // Redirect to login page
        navigate("/")
      } else if (requiredLevel !== "any" && !hasRequiredLevel(user.userlevel, requiredLevel)) {
        // Redirect to dashboard if user doesn't have required level
        navigate("/dashboard")
      } else if (mounted) {
        // User is authenticated and has required level
        setShouldRender(true)
      }
    }

    return () => {
      mounted = false
    }
  }, [user, isLoading, requiredLevel, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Don't render children until we've confirmed the user should see this page
  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}
