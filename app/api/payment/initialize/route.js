// import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
// import { authOptions } from "../auth/[...nextauth]/route"
// import axios from "axios"

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }

//     const { eventId, amount, email } = await request.json()

//     // Calculate split amounts
//     const adminAmount = Math.round(amount * 0.13 * 100) // Convert to kobo
//     const creatorAmount = Math.round(amount * 0.87 * 100) // Convert to kobo
//     const totalAmount = Math.round(amount * 100) // Convert to kobo

//     const paystackData = {
//       email,
//       amount: totalAmount,
//       currency: "USD",
//       callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
//       metadata: {
//         eventId,
//         userId: session.user.id,
//         adminAmount,
//         creatorAmount,
//       },
//       split_code: process.env.PAYSTACK_SPLIT_CODE, // You'll need to create this in Paystack dashboard
//     }

//     const response = await axios.post("https://api.paystack.co/transaction/initialize", paystackData, {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//     })

//     return NextResponse.json(response.data.data)
//   } catch (error) {
//     console.error("Payment initialization error:", error)
//     return NextResponse.json({ message: "Payment initialization failed" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import Event from "@/models/Event"
import axios from "axios"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { eventId, amount, email, phone, quantity = 1, metadata = {} } = await request.json()

    await connectDB()

    // Get event and creator details
    const event = await Event.findById(eventId).populate("creator", "paystackSubaccountCode fullName")

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }

    if (!event.creator.paystackSubaccountCode) {
      return NextResponse.json({ message: "Event creator must set up payment account first" }, { status: 400 })
    }

    // Calculate amounts in kobo (Paystack uses kobo)
    const totalAmountKobo = Math.round(amount * 100)

    // Generate unique reference
    const reference = `EVT_${eventId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const paystackData = {
      email,
      amount: totalAmountKobo,
      currency: "ZAR", // Paystack primarily supports NGN, but you can use USD for international
      reference,
      callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
      metadata: {
        eventId,
        userId: session.user.id,
        quantity,
        eventName: event.eventName,
        buyerName: session.user.name,
        phone,
        ...metadata,
      },
      subaccount: event.creator.paystackSubaccountCode,
      transaction_charge: Math.round(totalAmountKobo * 0.13), // Platform takes 13%
      bearer: "subaccount", // Subaccount bears the transaction fee
    }

    const response = await axios.post("https://api.paystack.co/transaction/initialize", paystackData, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data.status) {
      return NextResponse.json({
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      })
    } else {
      return NextResponse.json({ message: "Payment initialization failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment initialization error:", error.response?.data || error.message)
    return NextResponse.json(
      {
        message: "Payment initialization failed",
        error: error.response?.data?.message || error.message,
      },
      { status: 500 },
    )
  }
}
