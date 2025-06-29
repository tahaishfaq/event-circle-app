import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import Event from "@/models/Event"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Find all events where user is an attendee
    const events = await Event.find({
      "attendees.user": session.user.id,
    })
      .populate("creator", "fullName username profilePicture")
      .sort({ eventDate: 1 })

    // Extract user's tickets from each event
    const tickets = []

    events.forEach((event) => {
      const userAttendees = event.attendees.filter((attendee) => attendee.user.toString() === session.user.id)

      userAttendees.forEach((attendee) => {
        tickets.push({
          _id: attendee._id,
          event: {
            _id: event._id,
            eventName: event.eventName,
            eventDate: event.eventDate,
            eventTime: event.eventTime,
            eventLocation: event.eventLocation,
            duration: event.duration,
            videoThumbnail: event.videoThumbnail,
            creator: event.creator,
            category: event.category,
          },
          ticketNumber: attendee.ticketNumber,
          purchaseDate: attendee.purchaseDate,
          amount: attendee.amount,
          paymentReference: attendee.paymentReference,
          paystackData: attendee.paystackData,
        })
      })
    })

    // Separate upcoming and past events
    const now = new Date()
    const upcomingTickets = tickets.filter((ticket) => new Date(ticket.event.eventDate) >= now)
    const pastTickets = tickets.filter((ticket) => new Date(ticket.event.eventDate) < now)

    return NextResponse.json({
      upcomingTickets,
      pastTickets,
      totalTickets: tickets.length,
    })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
