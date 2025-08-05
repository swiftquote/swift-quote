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

    // Get user's referrals
    const referrals = await db.referral.findMany({
      where: {
        referrerId: session.user.id
      },
      include: {
        referred: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Generate referral link
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/signup?ref=${session.user.id}`

    return NextResponse.json({ referrals, referralLink })
  } catch (error) {
    console.error("Error fetching referrals:", error)
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

    const { referrerId } = await request.json()

    if (!referrerId) {
      return NextResponse.json(
        { message: "Referrer ID is required" },
        { status: 400 }
      )
    }

    // Check if referral already exists
    const existingReferral = await db.referral.findUnique({
      where: {
        referredId: session.user.id
      }
    })

    if (existingReferral) {
      return NextResponse.json(
        { message: "Referral already exists" },
        { status: 400 }
      )
    }

    // Check if referrer exists
    const referrer = await db.user.findUnique({
      where: { id: referrerId }
    })

    if (!referrer) {
      return NextResponse.json(
        { message: "Referrer not found" },
        { status: 404 }
      )
    }

    // Create referral
    const referral = await db.referral.create({
      data: {
        referrerId,
        referredId: session.user.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ referral })
  } catch (error) {
    console.error("Error creating referral:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}