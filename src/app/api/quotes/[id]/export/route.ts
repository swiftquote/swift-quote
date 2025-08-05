import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import jsPDF from 'jspdf'

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

    // Generate PDF
    const doc = new jsPDF()
    
    // Set font
    doc.setFont("helvetica")
    
    // Title
    doc.setFontSize(20)
    doc.text(quote.title || `Quote for ${quote.clientName}`, 20, 30)
    
    // Business Info
    if (quote.user.profile) {
      doc.setFontSize(12)
      let yPos = 50
      
      if (quote.user.profile.businessName) {
        doc.text(quote.user.profile.businessName, 20, yPos)
        yPos += 8
      }
      if (quote.user.profile.phone) {
        doc.text(`Phone: ${quote.user.profile.phone}`, 20, yPos)
        yPos += 8
      }
      if (quote.user.profile.address) {
        doc.text(quote.user.profile.address, 20, yPos)
        yPos += 8
      }
    }
    
    // Quote Info
    doc.setFontSize(10)
    doc.text(`Quote Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 150, 50)
    doc.text(`Quote #: ${quote.id.slice(-6).toUpperCase()}`, 150, 58)
    
    // Client Info
    doc.setFontSize(14)
    doc.text("Bill To:", 20, 90)
    doc.setFontSize(12)
    let clientYPos = 100
    doc.text(quote.clientName, 20, clientYPos)
    clientYPos += 8
    if (quote.clientEmail) {
      doc.text(quote.clientEmail, 20, clientYPos)
      clientYPos += 8
    }
    if (quote.clientPhone) {
      doc.text(quote.clientPhone, 20, clientYPos)
      clientYPos += 8
    }
    if (quote.clientAddress) {
      doc.text(quote.clientAddress, 20, clientYPos)
    }
    
    // Line Items
    doc.setFontSize(14)
    doc.text("Items:", 20, 140)
    
    // Table headers
    doc.setFontSize(10)
    let tableY = 150
    doc.text("Description", 20, tableY)
    doc.text("Qty", 120, tableY)
    doc.text("Unit Price", 140, tableY)
    doc.text("Total", 170, tableY)
    
    // Line items
    tableY += 10
    quote.lineItems.forEach((item) => {
      // Wrap description if too long
      const splitDescription = doc.splitTextToSize(item.description, 90)
      doc.text(splitDescription, 20, tableY)
      doc.text(item.quantity.toString(), 120, tableY)
      doc.text(`£${item.unitPrice.toFixed(2)}`, 140, tableY)
      doc.text(`£${item.total.toFixed(2)}`, 170, tableY)
      tableY += splitDescription.length * 5 + 5
    })
    
    // Totals
    tableY += 10
    doc.text(`Subtotal: £${quote.subtotal.toFixed(2)}`, 140, tableY)
    tableY += 8
    doc.text(`VAT (${(quote.vatRate * 100)}%): £${quote.vatAmount.toFixed(2)}`, 140, tableY)
    tableY += 8
    
    if (quote.discount > 0) {
      doc.text(`Discount: -£${quote.discount.toFixed(2)}`, 140, tableY)
      tableY += 8
    }
    
    doc.setFontSize(12)
    doc.text(`Total: £${quote.total.toFixed(2)}`, 140, tableY)
    
    // Notes
    if (quote.notes) {
      doc.setFontSize(10)
      doc.text("Notes:", 20, tableY + 20)
      const splitNotes = doc.splitTextToSize(quote.notes, 170)
      doc.text(splitNotes, 20, tableY + 30)
    }
    
    // Generate PDF as blob
    const pdfBlob = doc.output('blob')
    
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quote.clientName}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })
    
  } catch (error) {
    console.error("Error exporting quote:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}