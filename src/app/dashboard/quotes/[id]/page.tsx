"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

interface Quote {
  id: string
  title: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  notes: string
  subtotal: number
  vatRate: number
  vatAmount: number
  discount: number
  total: number
  status: string
  shareToken?: string
  createdAt: string
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export default function QuotePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('id') || ''
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session && quoteId) {
      fetchQuote()
    }
  }, [session, quoteId])

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data.quote)
      } else {
        toast.error("Quote not found")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("Failed to load quote")
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/quotes/${quoteId}/export`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `quote-${quote?.clientName}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("PDF exported successfully")
      } else {
        toast.error("Failed to export PDF")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsExporting(false)
    }
  }

  const generateShareLink = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/share`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        const shareUrl = `${window.location.origin}/quote/${data.shareToken}`
        
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl)
          toast.success("Share link copied to clipboard")
        } else {
          toast.success(`Share link: ${shareUrl}`)
        }
      } else {
        toast.error("Failed to generate share link")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const updateQuoteStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        setQuote(prev => prev ? { ...prev, status } : null)
        toast.success("Quote status updated")
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || !quote) {
    return null
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
              <Link href="/dashboard/quotes" className="text-gray-600 hover:text-gray-900">
                Quotes
              </Link>
              <span className="text-blue-600 font-medium">Quote Details</span>
            </nav>
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {quote.title || `Quote for ${quote.clientName}`}
              </h1>
              <p className="text-gray-600">
                Created on {new Date(quote.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                quote.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                quote.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {quote.status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex flex-wrap gap-4">
            <Button onClick={exportToPDF} disabled={isExporting}>
              {isExporting ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.download className="mr-2 h-4 w-4" />
              )}
              Export PDF
            </Button>
            <Button variant="outline" onClick={generateShareLink}>
              <Icons.share className="mr-2 h-4 w-4" />
              Share Link
            </Button>
            <Link href={`/dashboard/quotes/${quote.id}/edit`}>
              <Button variant="outline">
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            
            {quote.status === 'DRAFT' && (
              <Button 
                variant="outline" 
                onClick={() => updateQuoteStatus('SENT')}
              >
                Mark as Sent
              </Button>
            )}
            
            {quote.status === 'SENT' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => updateQuoteStatus('ACCEPTED')}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Icons.checkCircle className="mr-2 h-4 w-4" />
                  Mark as Accepted
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => updateQuoteStatus('REJECTED')}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Icons.alertCircle className="mr-2 h-4 w-4" />
                  Mark as Rejected
                </Button>
              </>
            )}
            
            <Link href="/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Quote Content */}
          <div className="grid gap-8">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Name</Label>
                    <p className="text-lg">{quote.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-lg">{quote.clientEmail || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-lg">{quote.clientPhone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Address</Label>
                    <p className="text-lg">{quote.clientAddress || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 font-medium text-sm text-gray-500 pb-2 border-b">
                    <div className="col-span-12 md:col-span-6">Description</div>
                    <div className="col-span-12 md:col-span-2 text-center">Qty</div>
                    <div className="col-span-12 md:col-span-2 text-right">Unit Price</div>
                    <div className="col-span-12 md:col-span-2 text-right">Total</div>
                  </div>
                  {quote.lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 py-2 border-b">
                      <div className="col-span-12 md:col-span-6">{item.description}</div>
                      <div className="col-span-12 md:col-span-2 text-center">{item.quantity}</div>
                      <div className="col-span-12 md:col-span-2 text-right">£{item.unitPrice.toFixed(2)}</div>
                      <div className="col-span-12 md:col-span-2 text-right font-medium">£{item.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quote Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>£{quote.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({(quote.vatRate * 100)}%):</span>
                  <span>£{quote.vatAmount.toFixed(2)}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-£{quote.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>£{quote.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {quote.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{quote.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}