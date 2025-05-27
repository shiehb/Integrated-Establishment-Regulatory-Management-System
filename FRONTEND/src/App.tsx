import { useState, useEffect, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthGuard } from "@/components/auth-guard"
import { LoadingWave } from "@/components/ui/loading-wave"
import { AvatarProvider } from "@/hooks/use-avatar"
import { UserProvider } from "@/hooks/use-user"

// Pages
import LoginPage from "@/pages/login"
import Dashboard from "@/pages/dashboard"
import UsersPage from "@/pages/users"
import ProfilePage from "@/pages/profile"
import ProfileEditPage from "@/pages/profile/edit"
import Settings from "@/pages/settings"
import NotFound from "@/pages/not-found"

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingWave message="Loading..." />
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <UserProvider>
            <AvatarProvider>
              <Suspense fallback={<LoadingWave />}>
                <BrowserRouter>
                  <Routes> 
                    <Route path="/" element={<LoginPage />} />
                    
                    <Route
                      path="/users"
                      element={
                        <AuthGuard requiredLevel="admin">
                          <UsersPage />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <AuthGuard requiredLevel="any">
                          <ProfilePage />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/profile/edit"
                      element={
                        <AuthGuard requiredLevel="any">
                          <ProfileEditPage />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <AuthGuard requiredLevel="any">
                          <Dashboard />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <AuthGuard requiredLevel="any">
                          <Settings />
                        </AuthGuard>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </Suspense>
            </AvatarProvider>
          </UserProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
