import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripeClient, stripePrices } from "@/lib/stripe"; // ✅ Updated import

const stripe = getStripeClient(); // ✅ Safely gets Stripe with proper config

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return NextResponse.json(
        { message: "Invalid plan" },
        { status: 400 }
      );
    }

    // Lookup customer in DB
    let customer = await db.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    // ✅ Continue with your Stripe logic...

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
