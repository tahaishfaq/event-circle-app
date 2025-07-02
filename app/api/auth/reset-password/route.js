import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request) {
  try {
    await connectDB()

    const { email, otp, password } = await request.json()

    if (!email || !otp || !password) {
      return NextResponse.json({ message: "Email, OTP, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear OTP
    user.password = hashedPassword
    user.resetOTP = undefined
    user.resetOTPExpiry = undefined
    await user.save()

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
