// import { NextResponse } from "next/server"
// import axios from "axios"
// import { connectDB } from "@/lib/mongodb"
// import Event from "@/models/Event"

// export async function POST(request) {
//   try {
//     const { reference } = await request.json()

//     // Verify payment with Paystack
//     const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       },
//     })

//     const paymentData = response.data.data

//     if (paymentData.status === "success") {
//       await connectDB()

//       const { eventId, userId } = paymentData.metadata

//       // Add user to event attendees
//       await Event.findByIdAndUpdate(eventId, {
//         $push: {
//           attendees: {
//             user: userId,
//             purchaseDate: new Date(),
//             paymentId: reference,
//           },
//         },
//       })

//       return NextResponse.json({
//         success: true,
//         message: "Payment verified and ticket purchased successfully",
//       })
//     } else {
//       return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 })
//     }
//   } catch (error) {
//     console.error("Payment verification error:", error)
//     return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import axios from "axios"
import { connectDB } from "@/lib/mongodb"
import Event from "@/models/Event"
import User from "@/models/User"


import { generateTicketPDF } from "../../../../lib/ticketGenerator"
import { sendTicketEmail } from "../../../../lib/emailService"

export async function POST(request) {
  try {
    const { reference } = await request.json()

    // Verify payment with Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const paymentData = response.data.data

    if (paymentData.status === "success") {
      await connectDB()

      const { eventId, userId, quantity = 1 } = paymentData.metadata

      // Get event and user details
      const [event, user] = await Promise.all([
        Event.findById(eventId).populate("creator", "fullName username email"),
        User.findById(userId, "fullName username email"),
      ])

      if (!event || !user) {
        return NextResponse.json(
          {
            success: false,
            message: "Event or user not found",
          },
          { status: 404 },
        )
      }

      // Check if user already has a ticket (prevent double booking)
      const existingAttendee = event.attendees.find((attendee) => attendee.user.toString() === userId)

      if (existingAttendee) {
        return NextResponse.json(
          {
            success: false,
            message: "You already have a ticket for this event",
          },
          { status: 400 },
        )
      }

      // Check if event has capacity
      if (event.attendees.length + quantity > event.capacity) {
        return NextResponse.json(
          {
            success: false,
            message: "Event is sold out",
          },
          { status: 400 },
        )
      }

      // Generate ticket numbers and add user to event attendees
      const newAttendees = Array.from({ length: quantity }, () => ({
        user: userId,
        purchaseDate: new Date(),
        paymentReference: reference,
        amount: paymentData.amount / 100 / quantity, // Convert from kobo and divide by quantity
        ticketNumber: generateTicketNumber(),
        paystackData: {
          transactionId: paymentData.id,
          reference: paymentData.reference,
          channel: paymentData.channel,
          paidAt: paymentData.paid_at,
        },
      }))

      await Event.findByIdAndUpdate(eventId, {
      $push: { attendees: { $each: newAttendees } },
    });

    // Generate PDF ticket
    const ticketData = {
      ticketNumbers: newAttendees.map((a) => a.ticketNumber),
      eventName: event.eventName,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      eventLocation: event.eventLocation,
      attendeeName: user.fullName,
      attendeeEmail: user.email,
      quantity: quantity,
      totalAmount: paymentData.amount / 100,
    };
      const ticketPDF = await generateTicketPDF(ticketData)

      // Send ticket and invoice via email
      await sendTicketEmail({
        to: user.email,
        attendeeName: user.fullName,
        eventName: event.eventName,
        ticketPDF,
        invoiceData: {
          invoiceNumber: `INV-${reference}`,
          date: new Date(),
          amount: paymentData.amount / 100,
          platformFee: (paymentData.amount / 100) * 0.13,
          quantity: quantity,
          reference: reference,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified and ticket purchased successfully",
        payment: {
          reference: paymentData.reference,
          amount: paymentData.amount / 100,
          paid_at: paymentData.paid_at,
          channel: paymentData.channel,
        },
        event: {
          _id: event._id,
          eventName: event.eventName,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          eventLocation: event.eventLocation,
          duration: event.duration,
          videoThumbnail: event.videoThumbnail,
        },
        tickets: newAttendees.map((a) => ({
          ticketNumber: a.ticketNumber,
          amount: a.amount,
        })),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Payment verification failed",
      },
      { status: 500 },
    )
  }
}

function generateTicketNumber() {
  return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

function generateQRCode(ticketNumber) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketNumber}`
}
