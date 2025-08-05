"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

interface Subscription {
  id: string
  status: string
  plan: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
}

export default function Billing() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchSubscription()
    }
  }, [session])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/billing/subscription")
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      toast.error("Failed to load subscription")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        const stripe = (window as any).Stripe
        await stripe.redirectToCheckout({ sessionId })
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create checkout session")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        toast.error("Failed to open customer portal")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isPro = subscription?.status === 'ACTIVE'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Icons.fileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Swift Quote</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <span className="text-blue-600 font-medium">Billing</span>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push("/api/auth/signout")
              }}
            >
              <Icons.logOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Billing & Subscription
            </h1>
            <p className="text-gray-600">
              Manage your Swift Quote subscription
            </p>
          </div>

          {/* Current Subscription Status */}
          {subscription && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status === 'ACTIVE' ? 'Pro Plan' : 'Free Plan'}
                      </span>
                      {subscription.status === 'ACTIVE' && (
                        <span className="text-sm text-gray-600">
                          {subscription.plan === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                        </span>
                      )}
                    </div>
                    {subscription.currentPeriodEnd && (
                      <p className="text-sm text-gray-600 mt-1">
                        Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {subscription.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Icons.settings className="mr-2 h-4 w-4" />
                      )}
                      Manage Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free Plan</CardTitle>
                <div className="text-4xl font-bold">£0</div>
                <CardDescription>Perfect for trying out Swift Quote</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>3 free quotes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Basic quote templates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>PDF export</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Shareable links</span>
                </div>
                {isPro ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="relative border-blue-500 border-2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                <div className="text-4xl font-bold">
                  £9.99<span className="text-lg font-normal">/month</span>
                </div>
                <CardDescription>Or £59.99/year (save 50%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Unlimited quotes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Advanced templates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Custom branding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icons.checkCircle className="h-5 w-5 text-green-600" />
                  <span>Analytics dashboard</span>
                </div>
                {isPro ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.settings className="mr-2 h-4 w-4" />
                    )}
                    Manage Subscription
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => handleSubscribe('monthly')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Icons.creditCard className="mr-2 h-4 w-4" />
                      )}
                      Subscribe Monthly
                    </Button>
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => handleSubscribe('yearly')}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Icons.creditCard className="mr-2 h-4 w-4" />
                      )}
                      Subscribe Yearly (Save 50%)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Comparison */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center py-2 border-b">
                  <div className="font-medium">Quotes</div>
                  <div className="text-center">3 per month</div>
                  <div className="text-center text-green-600 font-medium">Unlimited</div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center py-2 border-b">
                  <div className="font-medium">Templates</div>
                  <div className="text-center">Basic</div>
                  <div className="text-center text-green-600 font-medium">Advanced</div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center py-2 border-b">
                  <div className="font-medium">Custom Branding</div>
                  <div className="text-center">
                    <Icons.close className="h-5 w-5 text-red-600 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Icons.checkCircle className="h-5 w-5 text-green-600 mx-auto" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center py-2 border-b">
                  <div className="font-medium">Priority Support</div>
                  <div className="text-center">
                    <Icons.close className="h-5 w-5 text-red-600 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Icons.checkCircle className="h-5 w-5 text-green-600 mx-auto" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center py-2">
                  <div className="font-medium">Analytics</div>
                  <div className="text-center">
                    <Icons.close className="h-5 w-5 text-red-600 mx-auto" />
                  </div>
                  <div className="text-center">
                    <Icons.checkCircle className="h-5 w-5 text-green-600 mx-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}