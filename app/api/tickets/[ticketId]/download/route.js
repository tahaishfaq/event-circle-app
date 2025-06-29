import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/mongodb"
import Event from "@/models/Event"
import User from "@/models/User"
import { generateTicketPDF } from "@/lib/ticketGenerator"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Find the event and ticket
    const event = await Event.findOne({
      "attendees._id": params.ticketId,
      "attendees.user": session.user.id,
    }).populate("creator", "fullName username")

    if (!event) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 })
    }

    const ticket = event.attendees.find((attendee) => attendee._id.toString() === params.ticketId)

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 })
    }

    // Get user details
    const user = await User.findById(session.user.id).select("fullName email")

    // Generate ticket PDF
    const ticketData = {
      ticketNumbers: [ticket.ticketNumber],
      eventName: event.eventName,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      eventLocation: event.eventLocation,
      attendeeName: user.fullName,
      attendeeEmail: user.email,
      quantity: 1,
      totalAmount: ticket.amount,
      reference: ticket.paymentReference,
    }

    const pdfBuffer = await generateTicketPDF(ticketData)

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ticket-${ticket.ticketNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error downloading ticket:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
