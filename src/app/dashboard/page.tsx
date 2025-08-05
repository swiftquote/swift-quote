"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quotes, setQuotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchQuotes()
    }
  }, [session])

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/quotes")
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes || [])
      }
    } catch (error) {
      toast.error("Failed to load quotes")
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.fileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Swift Quote</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm">
                <Icons.user className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link href="/dashboard/billing">
              <Button variant="outline" size="sm">
                <Icons.creditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>
            </Link>
            <Link href="/dashboard/referrals">
              <Button variant="outline" size="sm">
                <Icons.gift className="h-4 w-4 mr-2" />
                Referrals
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" size="sm">
                <Icons.barChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Sign out logic will be handled by NextAuth
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
        <div className="grid gap-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session.user?.name || session.user?.email}!
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage your professional quotes
              </p>
            </div>
            <Link href="/dashboard/quotes/new">
              <Button size="lg">
                <Icons.plus className="h-5 w-5 mr-2" />
                New Quote
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                <Icons.fileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {quotes.filter(q => q.status === 'DRAFT').length} drafts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sent Quotes</CardTitle>
                <Icons.share className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {quotes.filter(q => q.status === 'SENT').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Waiting for response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted Quotes</CardTitle>
                <Icons.checkCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {quotes.filter(q => q.status === 'ACCEPTED').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully converted
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Quotes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
              <CardDescription>
                Your most recently created quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <div className="text-center py-12">
                  <Icons.fileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No quotes yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first professional quote
                  </p>
                  <Link href="/dashboard/quotes/new">
                    <Button>
                      <Icons.plus className="h-4 w-4 mr-2" />
                      Create Quote
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotes.slice(0, 5).map((quote: any) => (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h4 className="font-medium">{quote.title || `Quote for ${quote.clientName}`}</h4>
                        <p className="text-sm text-gray-600">
                          {quote.clientName} • £{quote.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          quote.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                          quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          quote.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {quote.status}
                        </span>
                        <Link href={`/dashboard/quotes/${quote.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {quotes.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/dashboard/quotes">
                        <Button variant="outline">
                          View All Quotes
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}