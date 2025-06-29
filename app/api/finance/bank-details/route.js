import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id).select("bankDetails")

    return NextResponse.json({ bankDetails: user?.bankDetails || null })
  } catch (error) {
    console.error("Error fetching bank details:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { bankDetails } = await request.json()

    await connectDB()

    await User.findByIdAndUpdate(session.user.id, {
      bankDetails: {
        accountNumber: bankDetails.accountNumber,
        bankName: bankDetails.bankName,
        branchCode: bankDetails.branchCode,
        accountHolder: bankDetails.accountHolder,
      },
    })

    return NextResponse.json({ message: "Bank details saved successfully" })
  } catch (error) {
    console.error("Error saving bank details:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
