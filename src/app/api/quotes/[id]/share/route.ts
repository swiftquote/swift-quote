import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const quote = await db.quote.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!quote) {
      return NextResponse.json(
        { message: "Quote not found" },
        { status: 404 }
      )
    }

    // Generate share token if not exists
    let shareToken = quote.shareToken
    if (!shareToken) {
      shareToken = randomUUID()
      await db.quote.update({
        where: { id: params.id },
        data: { shareToken }
      })
    }

    return NextResponse.json({ shareToken })
  } catch (error) {
    console.error("Error generating share link:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}