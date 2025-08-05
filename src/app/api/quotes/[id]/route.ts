import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
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
      },
      include: {
        lineItems: true
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
    console.error("Error fetching quote:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const { status } = await request.json()

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

    const updatedQuote = await db.quote.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json({ quote: updatedQuote })
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await db.quote.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Quote deleted successfully" })
  } catch (error) {
    console.error("Error deleting quote:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}