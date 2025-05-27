"use client"

import { useState, useCallback, useEffect } from "react"
import { 
  type User,
  authApi,
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItems
} from "@/lib/axios"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Removed unused axiosInstance
  const { navigate } = useSafeNavigation()

  const logout = useCallback(() => {
    removeLocalStorageItems('access_token', 'refresh_token', 'user')
    setUser(null)
    setError(null)
    navigate('/')
  }, [navigate])

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const { user } = await authApi.getUser()
      setUser(user)
      setLocalStorageItem('user', JSON.stringify(user))
    } catch (err) {
      logout()
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  const login = useCallback(async (id_number: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authApi.login({ id_number, password })
      setUser(response.user)
      setLocalStorageItem('user', JSON.stringify(response.user))
      
      // Wait for state updates before navigating
      await Promise.resolve()
      navigate('/dashboard')
      
      return { success: true, user: response.user }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        typeof err === 'object' && err !== null && 'detail' in err ?
          String(err.detail) : "Login failed"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
}, [navigate])

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = getLocalStorageItem('access_token')
      const storedUser = getLocalStorageItem('user')
      
      if (accessToken && storedUser) {
        try {
          await fetchUser()
        } catch {
          logout()
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [fetchUser, logout])

  return { 
    user, 
    error,
    login, 
    logout,
    isLoading,
    isAuthenticated: !!user && !!getLocalStorageItem('access_token'),
  }
}