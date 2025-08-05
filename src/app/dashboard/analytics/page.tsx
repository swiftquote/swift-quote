"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

interface AnalyticsData {
  totalQuotes: number
  totalRevenue: number
  conversionRate: number
  averageQuoteValue: number
  quotesByStatus: {
    DRAFT: number
    SENT: number
    ACCEPTED: number
    REJECTED: number
    EXPIRED: number
  }
  monthlyStats: Array<{
    month: string
    quotes: number
    revenue: number
    accepted: number
  }>
  topClients: Array<{
    name: string
    quotes: number
    revenue: number
  }>
}

export default function Analytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      toast.error("Failed to load analytics")
    } finally {
      setIsLoading(false)
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.barChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No analytics data available
          </h3>
          <p className="text-gray-600">
            Create some quotes to see your analytics
          </p>
        </div>
      </div>
    )
  }

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
              <Link href="/dashboard/billing" className="text-gray-600 hover:text-gray-900">
                Billing
              </Link>
              <Link href="/dashboard/referrals" className="text-gray-600 hover:text-gray-900">
                Referrals
              </Link>
              <span className="text-blue-600 font-medium">Analytics</span>
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track your business performance and quote metrics
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                <Icons.fileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalQuotes}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{analytics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  From accepted quotes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Icons.barChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Accepted / Sent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Quote Value</CardTitle>
                <Icons.calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{analytics.averageQuoteValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Per quote
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quote Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your quotes by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span>Draft</span>
                    </div>
                    <span className="font-medium">{analytics.quotesByStatus.DRAFT}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span>Sent</span>
                    </div>
                    <span className="font-medium">{analytics.quotesByStatus.SENT}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span>Accepted</span>
                    </div>
                    <span className="font-medium">{analytics.quotesByStatus.ACCEPTED}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span>Rejected</span>
                    </div>
                    <span className="font-medium">{analytics.quotesByStatus.REJECTED}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span>Expired</span>
                    </div>
                    <span className="font-medium">{analytics.quotesByStatus.EXPIRED}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>
                  Your most valuable clients by quotes and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topClients.length === 0 ? (
                  <div className="text-center py-8">
                    <Icons.users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No client data yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.topClients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.quotes} quotes</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£{client.revenue.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>
                Your quote and revenue performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.monthlyStats.length === 0 ? (
                <div className="text-center py-8">
                  <Icons.barChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No monthly data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.monthlyStats.map((month, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{month.quotes}</p>
                        <p className="text-sm text-gray-500">quotes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">£{month.revenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{month.accepted}</p>
                        <p className="text-sm text-gray-500">accepted</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}