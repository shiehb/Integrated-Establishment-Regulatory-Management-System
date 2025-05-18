"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"
import { AlertCircle, User2, KeyRound, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  id_number: z.string().min(1, "ID Number is required"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginForm() {
  const { login } = useAuth()
  const { navigate } = useSafeNavigation()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_number: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setLoginError(null)
    try {
      await login(values.id_number, values.password)
      // Use our safe navigation method
      navigate("/dashboard")
    } catch (error) {
      setLoginError("Invalid ID number or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-none shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center text-center mb-2">
            <span className="text-xs md:text-xl font-bold text-muted-foreground">
              Integrated Establishment Regulatory
            </span>
            <span className="text-xs md:text-xl font-bold text-muted-foreground">Management System</span>
          </div>
          <CardTitle>
            <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-bold">
              <User2 className="text-primary" size={22} />
              Account Login
            </div>
          </CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g. 12345678"
                          autoComplete="username"
                          {...field}
                          className="pl-10"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onChange={(e) => {
                            // Only allow numbers
                            field.onChange(e.target.value.replace(/\D/g, ""))
                          }}
                        />
                        <User2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <a href="#" className="text-xs text-blue-600 hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                          className="pl-10 pr-10"
                        />
                        <KeyRound
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          size={18}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <hr className="my-6 border-muted-foreground/30 w-full" />
          <p className="text-center text-sm text-muted-foreground">
            By logging in, you agree to our{" "}
            <Dialog>
              <DialogTrigger asChild>
                <a
                  href="#"
                  className="font-bold underline-offset-4 hover:underline cursor-pointer hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-64 w-full pr-4">
                  {/* Replace with your actual Terms of Service content */}
                  <p>This is the Terms of Service content.</p>
                </ScrollArea>
              </DialogContent>
            </Dialog>{" "}
            and{" "}
            <Dialog>
              <DialogTrigger asChild>
                <a
                  href="#"
                  className="font-bold underline-offset-4 hover:underline cursor-pointer hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-64 w-full pr-4">
                  {/* Replace with your actual Privacy Policy content */}
                  <p>This is the Privacy Policy content.</p>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            .
          </p>
          <div className="text-center text-xs text-muted-foreground mt-4">
            <p>Demo Credentials:</p>
            <p>
              Admin: ID Number <strong>12345678</strong> / password <strong>admin123</strong>
            </p>
            <p>
              Manager: ID Number <strong>87654321</strong> / password <strong>manager123</strong>
            </p>
            <p>
              Inspector: ID Number <strong>11223344</strong> / password <strong>inspector123</strong>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
