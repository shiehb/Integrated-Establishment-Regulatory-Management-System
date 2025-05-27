export type UserLevel = 'admin' | 'manager' | 'inspector'

export type User = {
  id_number: string
  first_name: string
  last_name: string
  middle_name?: string
  email: string
  user_level: UserLevel
  status: 'active' | 'inactive'
  is_active?: boolean
  // Add any other profile-related fields
  full_name?: string // Optional, can be computed
  display_name?: string // Optional, can be used for custom display names
}

export const ACCESS_LEVELS: Record<UserLevel | 'any', UserLevel[]> = {
  admin: ['admin'],
  manager: ['admin', 'manager'],
  inspector: ['admin', 'manager', 'inspector'],
  any: []
} as const