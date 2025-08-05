import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const quote = await db.quote.findUnique({
      where: {
        shareToken: params.token
      },
      include: {
        lineItems: true,
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json(
        { message: "Quote not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error("Error fetching shared quote:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}