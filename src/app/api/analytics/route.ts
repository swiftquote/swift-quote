import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's quotes with analytics
    const quotes = await db.quote.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        lineItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate basic metrics
    const totalQuotes = quotes.length
    const totalRevenue = quotes
      .filter(q => q.status === 'ACCEPTED')
      .reduce((sum, q) => sum + q.total, 0)
    
    const sentQuotes = quotes.filter(q => q.status === 'SENT').length
    const acceptedQuotes = quotes.filter(q => q.status === 'ACCEPTED').length
    const conversionRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0
    
    const averageQuoteValue = totalQuotes > 0 ? 
      quotes.reduce((sum, q) => sum + q.total, 0) / totalQuotes : 0

    // Quote status distribution
    const quotesByStatus = {
      DRAFT: quotes.filter(q => q.status === 'DRAFT').length,
      SENT: quotes.filter(q => q.status === 'SENT').length,
      ACCEPTED: quotes.filter(q => q.status === 'ACCEPTED').length,
      REJECTED: quotes.filter(q => q.status === 'REJECTED').length,
      EXPIRED: quotes.filter(q => q.status === 'EXPIRED').length,
    }

    // Monthly stats (last 6 months)
    const monthlyStats = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthQuotes = quotes.filter(q => {
        const quoteDate = new Date(q.createdAt)
        return quoteDate >= monthDate && quoteDate < nextMonthDate
      })
      
      const monthRevenue = monthQuotes
        .filter(q => q.status === 'ACCEPTED')
        .reduce((sum, q) => sum + q.total, 0)
      
      const monthAccepted = monthQuotes.filter(q => q.status === 'ACCEPTED').length
      
      monthlyStats.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        quotes: monthQuotes.length,
        revenue: monthRevenue,
        accepted: monthAccepted
      })
    }

    // Top clients
    const clientStats = new Map()
    
    quotes.forEach(quote => {
      if (!clientStats.has(quote.clientName)) {
        clientStats.set(quote.clientName, {
          name: quote.clientName,
          quotes: 0,
          revenue: 0
        })
      }
      
      const client = clientStats.get(quote.clientName)
      client.quotes += 1
      
      if (quote.status === 'ACCEPTED') {
        client.revenue += quote.total
      }
    })
    
    const topClients = Array.from(clientStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const analytics = {
      totalQuotes,
      totalRevenue,
      conversionRate,
      averageQuoteValue,
      quotesByStatus,
      monthlyStats,
      topClients
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}