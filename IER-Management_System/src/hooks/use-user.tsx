import { createContext, useContext, useState } from "react"

interface User {
  name: string
  email: string
  id_number: string
  userlevel?: string
}

interface UserContextType {
  user: User | null
  updateUser: (user: User) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    name: "Admin User",
    email: "12345678@emb.gov.ph",
    id_number: "12345678",
    userlevel: "admin"
  })

  const updateUser = (newUser: User) => {
    setUser(newUser)
  }

  return (
    <UserContext.Provider value={{ user, updateUser }}>
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