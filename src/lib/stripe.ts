import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export const getStripe = (): Stripe => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable")
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia",
    })
  }

  return stripeInstance
}

// For backward compatibility, export stripe as a getter
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe]
  }
})

export const stripePrices = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 999,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 5999,
  },
}
