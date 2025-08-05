import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe" // ✅ Named import
import { db } from "@/lib/db"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature")!

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object as any
        await handleCheckoutSessionCompleted(checkoutSession)
        break
      case "customer.subscription.updated":
        const subscriptionUpdated = event.data.object as any
        await handleSubscriptionUpdated(subscriptionUpdated)
        break
      case "customer.subscription.deleted":
        const subscriptionDeleted = event.data.object as any
        await handleSubscriptionDeleted(subscriptionDeleted)
        break
      case "invoice.payment_succeeded":
        const invoiceSucceeded = event.data.object as any
        await handleInvoicePaymentSucceeded(invoiceSucceeded)
        break
      case "invoice.payment_failed":
        const invoiceFailed = event.data.object as any
        await handleInvoicePaymentFailed(invoiceFailed)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const { userId, plan } = session.metadata

  if (!userId) {
    console.error("No userId in session metadata")
    return
  }

  try {
    await db.subscription.upsert({
      where: { userId },
      update: {
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        status: "ACTIVE",
        plan: plan === "monthly" ? "MONTHLY" : "YEARLY",
        currentPeriodStart: new Date(session.current_period_start * 1000),
        currentPeriodEnd: new Date(session.current_period_end * 1000),
      },
      create: {
        userId,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        status: "ACTIVE",
        plan: plan === "monthly" ? "MONTHLY" : "YEARLY",
        currentPeriodStart: new Date(session.current_period_start * 1000),
        currentPeriodEnd: new Date(session.current_period_end * 1000),
      },
    })

    await db.payment.create({
      data: {
        userId,
        subscriptionId: session.subscription,
        stripePaymentIntentId: session.payment_intent,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: "SUCCEEDED",
      },
    })

    console.log(`Subscription activated for user ${userId}`)
  } catch (error) {
    console.error("Error handling checkout session completed:", error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer

    const userSubscription = await db.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!userSubscription) {
      console.error("No subscription found for customer:", customerId)
      return
    }

    await db.subscription.update({
      where: { userId: userSubscription.userId },
      data: {
        status:
          subscription.status === "active"
            ? "ACTIVE"
            : subscription.status === "past_due"
            ? "PAST_DUE"
            : subscription.status === "canceled"
            ? "CANCELLED"
            : "INACTIVE",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })

    console.log(`Subscription updated for user ${userSubscription.userId}`)
  } catch (error) {
    console.error("Error handling subscription updated:", error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer

    const userSubscription = await db.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!userSubscription) {
      console.error("No subscription found for customer:", customerId)
      return
    }

    await db.subscription.update({
      where: { userId: userSubscription.userId },
      data: {
        status: "CANCELLED",
      },
    })

    console.log(`Subscription cancelled for user ${userSubscription.userId}`)
  } catch (error) {
    console.error("Error handling subscription deleted:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const subscriptionId = invoice.subscription

    if (!subscriptionId) return

    const subscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    })

    if (!subscription) return

    await db.payment.create({
      data: {
        userId: subscription.userId,
        subscriptionId: subscriptionId,
        stripePaymentIntentId: invoice.payment_intent,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: "SUCCEEDED",
      },
    })

    console.log(`Payment recorded for subscription ${subscriptionId}`)
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error)
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const subscriptionId = invoice.subscription

    if (!subscriptionId) return

    const subscription = await db.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    })

    if (!subscription) return

    await db.payment.create({
      data: {
        userId: subscription.userId,
        subscriptionId: subscriptionId,
        stripePaymentIntentId: invoice.payment_intent,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        status: "FAILED",
      },
    })

    console.log(`Failed payment recorded for subscription ${subscriptionId}`)
  } catch (error) {
    console.error("Error handling invoice payment failed:", error)
  }
}
