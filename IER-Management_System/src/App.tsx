import { Switch, Route } from "wouter"
import { Suspense } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthGuard } from "@/components/auth-guard"
import { LoadingWave } from "@/components/ui/loading-wave"

// Pages
import LoginPage from "@/pages/login"
import Dashboard from "@/pages/dashboard"
import UsersPage from "@/pages/users"
import ProfilePage from "@/pages/profile"
import ProfileEditPage from "@/pages/profile/edit"
import NotFound from "@/pages/not-found"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={<LoadingWave logoUrl="/placeholder.svg?height=48&width=48" className="h-screen" />}>
            <Switch>
              <Route path="/" component={LoginPage} />

              {/* Protected routes */}
              <Route path="/dashboard">
                <AuthGuard requiredLevel="any">
                  <Dashboard />
                </AuthGuard>
              </Route>

              {/* Users management - Admin only */}
              <Route path="/users">
                <AuthGuard requiredLevel="admin">
                  <UsersPage />
                </AuthGuard>
              </Route>

              {/* Profile page - Any authenticated user */}
              <Route path="/profile">
                <AuthGuard requiredLevel="any">
                  <ProfilePage />
                </AuthGuard>
              </Route>

              {/* Profile edit page - Any authenticated user */}
              <Route path="/profile/edit">
                <AuthGuard requiredLevel="any">
                  <ProfileEditPage />
                </AuthGuard>
              </Route>

              {/* Admin-only routes example */}
              <Route path="/admin">
                <AuthGuard requiredLevel="admin">
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Admin Area</h1>
                    <p>This page is only accessible to administrators.</p>
                  </div>
                </AuthGuard>
              </Route>

              {/* Manager-level routes example */}
              <Route path="/management">
                <AuthGuard requiredLevel="manager">
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Management Area</h1>
                    <p>This page is accessible to managers and administrators.</p>
                  </div>
                </AuthGuard>
              </Route>

              {/* Fallback to 404 */}
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
