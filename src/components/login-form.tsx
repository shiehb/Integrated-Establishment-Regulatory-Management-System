"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingWave } from "@/components/ui/loading-wave"
import { AlertCircle, User2, KeyRound, Eye, EyeOff, Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSafeNavigation } from "@/hooks/use-safe-navigation"

const MAX_ATTEMPTS = 10
const LOCKOUT_DURATION = 5 * 60 * 1000

const formSchema = z.object({
  id_number: z.string().min(1, "ID Number is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginErrorResponse = {
  message?: string
}

export default function LoginForm() {
  const { login } = useAuth()
  const { navigate } = useSafeNavigation()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)

  // Check for existing lockout state on component mount
  useEffect(() => {
    const storedLockout = localStorage.getItem('loginLockout')
    if (storedLockout) {
      const { timestamp } = JSON.parse(storedLockout)
      const currentTime = Date.now()
      const elapsed = currentTime - timestamp
      
      if (elapsed < LOCKOUT_DURATION) {
        setIsLocked(true)
        setLockoutTime(timestamp)
        setRemainingTime(Math.ceil((LOCKOUT_DURATION - elapsed) / 1000))
      } else {
        localStorage.removeItem('loginLockout')
      }
    }
  }, [])

  // Update remaining time if locked
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isLocked && lockoutTime) {
      interval = setInterval(() => {
        const currentTime = Date.now()
        const elapsed = currentTime - lockoutTime
        const newRemaining = Math.ceil((LOCKOUT_DURATION - elapsed) / 1000)
        
        if (newRemaining <= 0) {
          setIsLocked(false)
          setLockoutTime(null)
          setAttempts(0)
          localStorage.removeItem('loginLockout')
          clearInterval(interval)
        } else {
          setRemainingTime(newRemaining)
        }
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isLocked, lockoutTime])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_number: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLocked) return
    
    setIsLoading(true)
    setLoginError(null)
    
    try {
      await login(values.id_number, values.password)
      // Reset attempts on successful login
      setAttempts(0)
      localStorage.removeItem('loginLockout')
      toast.success("Login successful", {
        description: "Redirecting to dashboard...",
        position: "top-center",
      })
      navigate("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      let errorMessage = "Invalid credentials"
      
      // Handle Fetch API errors
      if (error instanceof Error) {
        try {
          // If the error has a JSON response
          const errorResponse = JSON.parse(error.message) as LoginErrorResponse
          errorMessage = errorResponse.message || "Invalid credentials"
        } catch {
          // If it's a regular error
          errorMessage = error.message || "Invalid credentials"
        }
      }
      
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockoutTimestamp = Date.now()
      setIsLocked(true)
      setLockoutTime(lockoutTimestamp)
      setRemainingTime(Math.ceil(LOCKOUT_DURATION / 1000))
      localStorage.setItem('loginLockout', JSON.stringify({
        timestamp: lockoutTimestamp
      }))

      errorMessage = `Too many failed attempts. Please try again in ${Math.ceil(LOCKOUT_DURATION / 60000)} minutes.`
    } else if (newAttempts >= 5) {
      errorMessage += ` (${MAX_ATTEMPTS - newAttempts} attempts remaining)`
    }
      
      // Clear form fields and set error states
      form.reset()
      setLoginError(errorMessage)
      
      toast.error("Login failed", {
        description: errorMessage,
        position: "top-center",
        duration: 5000,
        action: newAttempts < MAX_ATTEMPTS ? {
          label: "Retry",
          onClick: () => {
            form.setFocus("id_number")
          },
        } : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingWave message="Authenticating..." />
  }

  return (
    <div className="flex flex-col gap-6 max-w-[400px] mx-auto">
      <Card className="border-1 shadow-lg">
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
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLocked ? (
            <Alert variant="destructive">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Account temporarily locked. Please try again in {Math.floor(remainingTime / 60)}:
                  {(remainingTime % 60).toString().padStart(2, '0')} minutes.
                </AlertDescription>
              </div>
            </Alert>
          ) : loginError && (
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
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g. 12345678"
                          autoComplete="username"
                          {...field}
                          className={`pl-10 ${fieldState.error ? "border-destructive" : ""}`}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                          disabled={isLocked || isLoading}
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
                render={({ field, fieldState }) => (
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
                          className={`pl-10 pr-10 ${fieldState.error ? "border-destructive" : ""}`}
                          disabled={isLocked || isLoading}
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
                          disabled={isLocked || isLoading}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isLocked}
              >
                {isLoading ? "Logging in..." : isLocked ? "Account Locked" : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col">
          <hr className="my-1 border-muted-foreground/30 w-full" />
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
                  <p>This is the Privacy Policy content.</p>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
