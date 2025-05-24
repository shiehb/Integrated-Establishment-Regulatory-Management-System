"use client"

import { useState, useCallback, useEffect } from "react"

// Updated User type with userlevel instead of role
type User = {
  id_number: string
  name: string
  userlevel: "admin" | "manager" | "inspector"
}

type LoginFunction = (id_number: string, password: string) => Promise<void>

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      // If there's an error parsing the stored user, clear it
      localStorage.removeItem("user")
    } finally {
      // Always set loading to false after checking for a stored user
      setIsLoading(false)
    }
  }, [])

  // Login function
  const login: LoginFunction = useCallback(async (id_number, password) => {
    setIsLoading(true)
    try {
      // Updated demo accounts with userlevel
      const demoAccounts = [
        { id_number: "12345678", password: "admin123", name: "Admin User", userlevel: "admin" as const },
        { id_number: "87654321", password: "manager123", name: "Manager User", userlevel: "manager" as const },
        { id_number: "11223344", password: "inspector123", name: "Inspector User", userlevel: "inspector" as const },
      ]

      const account = demoAccounts.find((acc) => acc.id_number === id_number && acc.password === password)

      await new Promise((res) => setTimeout(res, 500)) // simulate network delay

      if (!account) {
        throw new Error("Invalid credentials")
      }

      const userData: User = {
        id_number: account.id_number,
        name: account.name,
        userlevel: account.userlevel,
      }

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("user")
    setUser(null)
  }, [])

  return { user, login, logout, isLoading }
}
