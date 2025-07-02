import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request) {
  try {
    await connectDB()

    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 })
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
