"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

// Separate component that uses useSearchParams
function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [referrerId, setReferrerId] = useState("")

  useEffect(() => {
    // Get referrer ID from URL parameters
    const ref = searchParams.get('ref')
    if (ref) {
      setReferrerId(ref)
    }

    // If user is already authenticated, redirect to dashboard
    if (session) {
      router.push("/dashboard")
    }
  }, [searchParams, session, router])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // First, create the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          referrerId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || "Something went wrong")
        return
      }

      // Create referral if referrerId exists
      if (referrerId) {
        try {
          await fetch("/api/referrals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ referrerId }),
          })
        } catch (error) {
          console.error("Failed to create referral:", error)
        }
      }

      // Then sign in the user
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Account created but sign in failed")
      } else {
        router.push("/dashboard")
        toast.success("Account created successfully")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithGoogle() {
    setIsGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your information to create your account
        </CardDescription>
        {referrerId && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800 text-center">
              You've been invited by a friend! Sign up to claim your referral.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 gap-6">
          <Button
            variant="outline"
            onClick={signInWithGoogle}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                type="text"
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="Password"
                type="password"
                autoCapitalize="none"
                autoComplete="new-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                placeholder="Confirm Password"
                type="password"
                autoCapitalize="none"
                autoComplete="new-password"
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button disabled={isLoading} className="w-full">
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Account
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm text-muted-foreground w-full">
          Already have an account?{" "}
          <Link href="/auth/signin" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

// Main component wrapped with Suspense
export default function SignUp() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
