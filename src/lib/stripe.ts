import Stripe from "stripe"

const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

// Export the Stripe instance directly
export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-12-18.acacia",
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
 