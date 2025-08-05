import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

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
  createdAt: string
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  user: {
    name?: string
    email: string
    profile?: {
      businessName?: string
      phone?: string
      address?: string
      website?: string
    }
  }
}

async function getQuote(token: string): Promise<Quote | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/quote/${token}`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.quote
    }
    return null
  } catch (error) {
    console.error("Error fetching quote:", error)
    return null
  }
}

export default async function SharedQuotePage({
  params
}: {
  params: { token: string }
}) {
  const quote = await getQuote(params.token)

  if (!quote) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icons.fileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">Swift Quote</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {quote.title || `Quote for ${quote.clientName}`}
          </h1>
          <p className="text-gray-600">
            Created on {new Date(quote.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Business Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>From</CardTitle>
          </CardHeader>
          <CardContent>
            {quote.user.profile?.businessName && (
              <p className="font-medium text-lg mb-2">{quote.user.profile.businessName}</p>
            )}
            <p className="text-gray-600">{quote.user.name || quote.user.email}</p>
            {quote.user.profile?.phone && (
              <p className="text-gray-600">Phone: {quote.user.profile.phone}</p>
            )}
            {quote.user.profile?.address && (
              <p className="text-gray-600">Address: {quote.user.profile.address}</p>
            )}
            {quote.user.profile?.website && (
              <p className="text-gray-600">Website: {quote.user.profile.website}</p>
            )}
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-lg mb-2">{quote.clientName}</p>
            {quote.clientEmail && (
              <p className="text-gray-600">Email: {quote.clientEmail}</p>
            )}
            {quote.clientPhone && (
              <p className="text-gray-600">Phone: {quote.clientPhone}</p>
            )}
            {quote.clientAddress && (
              <p className="text-gray-600">Address: {quote.clientAddress}</p>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Items</CardTitle>
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{quote.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Created with Swift Quote - Professional quoting made simple</p>
        </div>
      </div>
    </div>
  )
}