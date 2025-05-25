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

                  <Route path="/dashboard">
                    <AuthGuard requiredLevel="any">
                      <Dashboard />
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

                  <Route path="/users">
                    <AuthGuard requiredLevel="admin">
                      <UsersPage />
                    </AuthGuard>
                  </Route>
                  
                  <Route path="/admin">
                    <AuthGuard requiredLevel="admin">
                      <div className="p-8">
                        <h1 className="text-2xl font-bold">Admin Area</h1>
                        <p>This page is only accessible to administrators.</p>
                      </div>
                    </AuthGuard>
                  </Route>

                  <Route path="/management">
                    <AuthGuard requiredLevel="manager">
                      <div className="p-8">
                        <h1 className="text-2xl font-bold">Management Area</h1>
                        <p>This page is accessible to managers and administrators.</p>
                      </div>
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
