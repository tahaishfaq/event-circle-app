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



// import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"
// import { connectDB } from "@/lib/mongodb"
// import Event from "@/models/Event"
// import User from "@/models/User"
// import axios from "axios"

// // Helper function to calculate age from date of birth
// function calculateAge(dateOfBirth) {
//   const today = new Date()
//   const birthDate = new Date(dateOfBirth)
//   let age = today.getFullYear() - birthDate.getFullYear()
//   const monthDiff = today.getMonth() - birthDate.getMonth()

//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//     age--
//   }

//   return age
// }

// // Helper function to check age restrictions
// function checkAgeRestriction(userAge, ageRestriction) {
//   if (ageRestriction === "no-restriction") return true

//   switch (ageRestriction) {
//     case "<18":
//       return userAge < 18
//     case "18-29":
//       return userAge >= 18 && userAge <= 29
//     case "30-39":
//       return userAge >= 30 && userAge <= 39
//     case "40<":
//       return userAge >= 40
//     default:
//       return true
//   }
// }

// // Helper function to check gender restrictions
// function checkGenderRestriction(userGender, genderRestriction) {
//   if (genderRestriction === "no-restriction" || genderRestriction === "all") return true
//   return userGender === genderRestriction
// }

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }

//     const { eventId, amount, email, phone, quantity = 1, metadata = {} } = await request.json()

//     await connectDB()

//     // Get event and creator details
//     const event = await Event.findById(eventId).populate("creator", "paystackSubaccountCode fullName")

//     if (!event) {
//       return NextResponse.json({ message: "Event not found" }, { status: 404 })
//     }

//     // Get user details for restriction checks
//     const user = await User.findById(session.user.id)
//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 })
//     }

//     // Check if user's email is verified
//     if (!user.isEmailVerified) {
//       return NextResponse.json(
//         {
//           message: "Please verify your email address before purchasing tickets",
//         },
//         { status: 400 },
//       )
//     }

//     // Calculate user's age
//     const userAge = calculateAge(user.dateOfBirth)

//     // Check age restrictions
//     if (!checkAgeRestriction(userAge, event.ageRestrictions)) {
//       let ageMessage = ""
//       switch (event.ageRestrictions) {
//         case "<18":
//           ageMessage = "This event is only for attendees under 18 years old"
//           break
//         case "18-29":
//           ageMessage = "This event is only for attendees between 18-29 years old"
//           break
//         case "30-39":
//           ageMessage = "This event is only for attendees between 30-39 years old"
//           break
//         case "40<":
//           ageMessage = "This event is only for attendees 40 years and above"
//           break
//         default:
//           ageMessage = "You don't meet the age requirements for this event"
//       }

//       return NextResponse.json(
//         {
//           message: ageMessage,
//           restriction: "age",
//           userAge,
//           requiredAge: event.ageRestrictions,
//         },
//         { status: 403 },
//       )
//     }

//     // Check gender restrictions
//     if (!checkGenderRestriction(user.gender, event.genderRestrictions)) {
//       const genderMessage =
//         event.genderRestrictions === "male"
//           ? "This event is only for male attendees"
//           : "This event is only for female attendees"

//       return NextResponse.json(
//         {
//           message: genderMessage,
//           restriction: "gender",
//           userGender: user.gender,
//           requiredGender: event.genderRestrictions,
//         },
//         { status: 403 },
//       )
//     }

//     // Check if event creator has set up payment account
//     if (!event.creator.paystackSubaccountCode) {
//       return NextResponse.json(
//         {
//           message: "Event creator hasn't connected their bank account yet",
//         },
//         { status: 400 },
//       )
//     }

//     // Check if event is sold out
//     if (event.attendees.length >= event.capacity) {
//       return NextResponse.json({ message: "Event is sold out" }, { status: 400 })
//     }

//     // Check if user has already registered for this event
//     const existingAttendee = event.attendees.find((attendee) => attendee.user.toString() === session.user.id)

//     if (existingAttendee) {
//       return NextResponse.json(
//         {
//           message: "You have already registered for this event",
//         },
//         { status: 400 },
//       )
//     }

//     // Convert ZAR to cents (Paystack uses cents for ZAR)
//     const amountInCents = Math.round(amount * 100)

//     // Generate unique reference
//     const reference = `EVT_${eventId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

//     const paymentData = {
//       email,
//       amount: amountInCents,
//       currency: "ZAR",
//       reference,
//       callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
//       metadata: {
//         eventId,
//         userId: session.user.id,
//         quantity,
//         eventName: event.eventName,
//         buyerName: session.user.name,
//         phone,
//         userAge,
//         userGender: user.gender,
//         ...metadata,
//       },
//       subaccount: event.creator.paystackSubaccountCode,
//       transaction_charge: Math.round(amountInCents * 0.13), // Platform takes 13%
//       bearer: "subaccount", // Creator pays the transaction fee from their 87%
//     }

//     console.log("Initializing ZAR payment:", paymentData)

//     const response = await axios.post("https://api.paystack.co/transaction/initialize", paymentData, {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//     })

//     if (response.data.status) {
//       return NextResponse.json({
//         authorization_url: response.data.data.authorization_url,
//         access_code: response.data.data.access_code,
//         reference: response.data.data.reference,
//       })
//     } else {
//       console.error("Payment initialization failed:", response.data)
//       return NextResponse.json(
//         {
//           message: "Payment initialization failed",
//         },
//         { status: 400 },
//       )
//     }
//   } catch (error) {
//     console.error("Payment initialization error:", error.response?.data || error.message)
//     return NextResponse.json(
//       {
//         message: "Payment initialization failed. Please try again.",
//       },
//       { status: 500 },
//     )
//   }
// }
