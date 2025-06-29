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

    // Get all events created by the user
    const events = await Event.find({ creator: session.user.id })
      .populate("attendees.user", "fullName username")
      .select("eventName videoThumbnail attendees ticketPrice createdAt")

    // Calculate earnings from ticket sales
    const earnings = []
    let totalEarnings = 0
    let thisMonthEarnings = 0
    let totalTicketsSold = 0

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    events.forEach((event) => {
      event.attendees.forEach((attendee) => {
        const totalAmount = attendee.amount || event.ticketPrice
        const platformFee = totalAmount * 0.13
        const creatorEarning = totalAmount - platformFee

        earnings.push({
          _id: `${event._id}_${attendee._id}`,
          event: {
            _id: event._id,
            eventName: event.eventName,
            videoThumbnail: event.videoThumbnail,
          },
          buyer: attendee.user,
          totalAmount,
          platformFee,
          creatorEarning,
          quantity: 1,
          purchaseDate: attendee.purchaseDate,
          paymentReference: attendee.paymentReference,
        })

        totalEarnings += creatorEarning
        totalTicketsSold += 1

        // Check if this month
        const purchaseDate = new Date(attendee.purchaseDate)
        if (purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear) {
          thisMonthEarnings += creatorEarning
        }
      })
    })

    // Sort earnings by date (newest first)
    earnings.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))

    const stats = {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      thisMonthEarnings: Math.round(thisMonthEarnings * 100) / 100,
      totalTicketsSold,
      activeEvents: events.filter((event) => new Date(event.eventDate) > new Date()).length,
    }

    return NextResponse.json({
      earnings: earnings.slice(0, 50),
      stats,
    })
  } catch (error) {
    console.error("Error fetching earnings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
