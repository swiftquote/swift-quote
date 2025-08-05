import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import stripe, { stripePrices } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { plan } = await request.json()
    
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json(
        { message: "Invalid plan" },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    let stripeCustomerId = user.subscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || '',
        metadata: {
          userId: user.id
        }
      })
      stripeCustomerId = customer.id
    }

    // Create checkout session
    const sessionData = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: plan === 'monthly' ? stripePrices.monthly.priceId : stripePrices.yearly.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan
      }
    })

    return NextResponse.json({ sessionId: sessionData.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}