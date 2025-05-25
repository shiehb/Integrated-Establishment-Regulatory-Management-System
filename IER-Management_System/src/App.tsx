import { useState, useEffect } from "react"
import { Switch, Route } from "wouter"
import { Suspense } from "react"
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
import  Settings  from "@/pages/Settings"
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
                <Switch>
                  <Route path="/" component={LoginPage} />

                  <Route path="/users">
                    <AuthGuard requiredLevel="admin">
                      <UsersPage />
                    </AuthGuard>
                  </Route>

                  <Route path="/profile">
                    <AuthGuard requiredLevel="any">
                      <ProfilePage />
                    </AuthGuard>
                  </Route>

                  <Route path="/profile/edit">
                    <AuthGuard requiredLevel="any">
                      <ProfileEditPage />
                    </AuthGuard>
                  </Route>

                  <Route path="/dashboard">
                    <AuthGuard requiredLevel="any">
                      <Dashboard />
                    </AuthGuard>
                  </Route>

                  <Route path="/settings">
                    <AuthGuard requiredLevel="any">
                      <Settings/>
                    </AuthGuard>
                  </Route>

                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </AvatarProvider>
          </UserProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
