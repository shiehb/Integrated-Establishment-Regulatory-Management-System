"use client"

import { useCallback } from "react"
import { useLocation } from "wouter"

/**
 * A hook that provides safe navigation methods that won't trigger
 * the "useInsertionEffect must not schedule updates" error.
 */
export function useSafeNavigation() {
  const [, setLocation] = useLocation()

  /**
   * Navigate to a new location safely by using the browser's
   * native history API directly instead of wouter's setLocation
   */
  const navigate = useCallback((path: string) => {
    // Use the browser's history API directly
    window.history.pushState({}, "", path)
    // Dispatch a popstate event to notify wouter of the change
    window.dispatchEvent(new PopStateEvent("popstate"))
  }, [])

  return { navigate }
}
