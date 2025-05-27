import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { User, UserLevel } from "@/types/user"
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItems } from "@/lib/axios"
import { ACCESS_LEVELS } from "@/types/user"

interface UserContextType {
  user: User | null
  updateUser: (user: User) => void
  clearUser: () => void
  isAdmin: boolean
  isManager: boolean
  isInspector: boolean
  hasAccess: (requiredLevel: UserLevel | UserLevel[]) => boolean
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = getLocalStorageItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch (error) {
      console.error('Error parsing stored user:', error)
      return null
    }
  })

  // Sync user state with localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue !== e.oldValue) {
        setUser(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const updateUser = useCallback((newUser: User) => {
    if (!newUser.user_level || !ACCESS_LEVELS[newUser.user_level]) {
      throw new Error('Invalid user level')
    }
    setUser(newUser)
    setLocalStorageItem('user', JSON.stringify(newUser))
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
    removeLocalStorageItems('user', 'access_token', 'refresh_token')
  }, [])

  const hasAccess = useCallback((requiredLevel: UserLevel | UserLevel[]) => {
    if (!user?.user_level) return false
    
    const levels = Array.isArray(requiredLevel) ? requiredLevel : [requiredLevel]
    return levels.some(level => ACCESS_LEVELS[level].includes(user.user_level))
  }, [user?.user_level])

  const value = {
    user,
    updateUser,
    clearUser,
    isAdmin: user?.user_level === 'admin',
    isManager: user?.user_level === 'manager',
    isInspector: user?.user_level === 'inspector',
    hasAccess,
    isAuthenticated: !!user && user.is_active !== false
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

export function useUserAccess() {
  const { user, hasAccess } = useUser()
  
  return {
    canAccessAdmin: hasAccess('admin'),
    canAccessManager: hasAccess(['admin', 'manager']),
    canAccessInspector: hasAccess(['admin', 'manager', 'inspector']),
    userLevel: user?.user_level,
    isActive: user?.is_active !== false
  }
}