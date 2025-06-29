import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import axios from "axios"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { bankDetails } = await request.json()

    await connectDB()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if user already has a subaccount
    if (user.paystackSubaccountCode) {
      return NextResponse.json({
        message: "Subaccount already exists",
        subaccountCode: user.paystackSubaccountCode,
      })
    }

    // Create subaccount with Paystack
    const subaccountData = {
      business_name: `${user.fullName} Events`,
      settlement_bank: bankDetails.bankCode, // Bank code from Paystack bank list
      account_number: bankDetails.accountNumber,
      percentage_charge: 87, // Creator gets 87%, platform keeps 13%
      description: `Event creator account for ${user.fullName}`,
      primary_contact_email: user.email,
      primary_contact_name: user.fullName,
      primary_contact_phone: user.phoneNumber,
      metadata: {
        userId: user._id.toString(),
        username: user.username,
      },
    }

    const response = await axios.post("https://api.paystack.co/subaccount", subaccountData, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data.status) {
      // Save subaccount code to user
      await User.findByIdAndUpdate(session.user.id, {
        paystackSubaccountCode: response.data.data.subaccount_code,
        bankDetails: {
          accountNumber: bankDetails.accountNumber,
          bankCode: bankDetails.bankCode,
          bankName: bankDetails.bankName,
          accountName: bankDetails.accountName,
        },
      })

      return NextResponse.json({
        message: "Subaccount created successfully",
        subaccountCode: response.data.data.subaccount_code,
        data: response.data.data,
      })
    } else {
      return NextResponse.json({ message: "Failed to create subaccount", error: response.data }, { status: 400 })
    }
  } catch (error) {
    console.error("Subaccount creation error:", error.response?.data || error.message)
    return NextResponse.json(
      {
        message: "Failed to create subaccount",
        error: error.response?.data?.message || error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)

    return NextResponse.json({
      hasSubaccount: !!user.paystackSubaccountCode,
      subaccountCode: user.paystackSubaccountCode,
      bankDetails: user.bankDetails,
    })
  } catch (error) {
    console.error("Error fetching subaccount:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
