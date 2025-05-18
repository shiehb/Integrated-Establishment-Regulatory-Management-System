import { apiRequest } from "@/lib/queryClient"

export type User = {
  id: number
  username: string
  name: string
  email?: string
  phoneNumber?: string
  role: "admin" | "user"
  active: boolean
}

export async function loginUser(username: string, password: string): Promise<User> {
  try {
    const response = await apiRequest("POST", "/api/auth/login", { username, password })
    const user = await response.json()
    return user
  } catch (error) {
    throw new Error("Failed to login. Please check your credentials.")
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/logout", null)
  } catch (error) {
    // Even if logout fails on the server, we'll clear the session on the client
    console.error("Error during logout:", error)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return null
      }
      throw new Error("Failed to fetch current user")
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}
