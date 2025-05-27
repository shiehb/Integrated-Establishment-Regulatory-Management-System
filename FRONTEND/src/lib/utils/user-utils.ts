import type { User } from "@/types/user"

export const getFullName = (user?: User | null) => {
  if (!user) return ""
  return [user.first_name, user.last_name].filter(Boolean).join(" ")
}

export const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return "U"
  return [firstName?.[0], lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase()
}