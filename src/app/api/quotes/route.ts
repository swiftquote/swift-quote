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

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      notes,
      lineItems,
      vatRate = 0.2,
      discount = 0
    } = body

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const vatAmount = subtotal * vatRate
    const total = subtotal + vatAmount - discount

    // Check quote limit for free users
    const userSubscription = await db.subscription.findUnique({
      where: { userId: session.user.id }
    })

    const isProUser = userSubscription?.status === 'ACTIVE'
    
    if (!isProUser) {
      const quoteCount = await db.quote.count({
        where: { userId: session.user.id }
      })
      
      if (quoteCount >= 3) {
        return NextResponse.json(
          { message: "Free plan limit reached. Upgrade to Pro for unlimited quotes." },
          { status: 403 }
        )
      }
    }

    // Create quote
    const quote = await db.quote.create({
      data: {
        userId: session.user.id,
        title,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        notes,
        subtotal,
        vatRate,
        vatAmount,
        discount,
        total,
        status: 'DRAFT',
        lineItems: {
          create: lineItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        lineItems: true
      }
    })

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    console.error("Error creating quote:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}