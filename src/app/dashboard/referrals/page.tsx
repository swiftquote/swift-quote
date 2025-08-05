"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

interface Referral {
  id: string
  status: string
  rewardGiven: boolean
  createdAt: string
  referred: {
    email: string
    name?: string
  }
}

export default function Referrals() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referralLink, setReferralLink] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchReferralData()
    }
  }, [session])

  const fetchReferralData = async () => {
    try {
      const response = await fetch("/api/referrals")
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.referrals || [])
        setReferralLink(data.referralLink || "")
      }
    } catch (error) {
      toast.error("Failed to load referral data")
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralLink = async () => {
    if (referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink)
        toast.success("Referral link copied to clipboard")
      } catch (error) {
        toast.error("Failed to copy link")
      }
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

  const completedReferrals = referrals.filter(r => r.status === 'COMPLETED').length
  const pendingReferrals = referrals.filter(r => r.status === 'PENDING').length
  const rewardedReferrals = referrals.filter(r => r.rewardGiven).length

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
              <span className="text-blue-600 font-medium">Referrals</span>
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
              Referral Program
            </h1>
            <p className="text-gray-600">
              Invite friends and earn free months of Swift Quote Pro
            </p>
          </div>

          {/* Referral Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Icons.users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referrals.length}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingReferrals} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Icons.checkCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedReferrals}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully converted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Free Months Earned</CardTitle>
                <Icons.gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rewardedReferrals}</div>
                <p className="text-xs text-muted-foreground">
                  Reward given
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>
                Share this link with friends to invite them to Swift Quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm">
                  {referralLink}
                </div>
                <Button onClick={copyReferralLink}>
                  <Icons.copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share your unique referral link with friends</li>
                  <li>• When they sign up and become a Pro member, you get 1 free month</li>
                  <li>• No limit on how many friends you can refer</li>
                  <li>• Free months are added to your current subscription</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
              <CardDescription>
                Track the status of your referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-12">
                  <Icons.users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No referrals yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start sharing your referral link to earn free months
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Friend</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Referred</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">
                          {referral.referred.name || referral.referred.email}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            referral.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            referral.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {referral.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {referral.rewardGiven ? (
                            <span className="text-green-600 flex items-center">
                              <Icons.checkCircle className="h-4 w-4 mr-1" />
                              Given
                            </span>
                          ) : referral.status === 'COMPLETED' ? (
                            <span className="text-yellow-600">Pending</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}