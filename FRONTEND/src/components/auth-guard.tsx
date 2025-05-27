"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"
import { ACCESS_LEVELS, type UserLevel } from "@/types/user"

type AuthGuardProps = {
  children: React.ReactNode
  requiredLevel?: UserLevel | 'any'
}

export function AuthGuard({ children, requiredLevel = "any" }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const { navigate } = useSafeNavigation()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      navigate('/')
    } else if (requiredLevel !== 'any' && user?.user_level) {
      const allowedLevels = ACCESS_LEVELS[requiredLevel]
      if (!allowedLevels.includes(user.user_level)) {
        navigate('/dashboard')
      }
    }
    setShouldRender(true)
  }, [isLoading, isAuthenticated, user, requiredLevel, navigate])

  return shouldRender ? <>{children}</> : null
}