import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { sendEmailVerification } from "../../../../lib/emailService"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const otp = searchParams.get("otp")

    if (!otp) {
      return NextResponse.json({ message: "Verification OTP is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({
      emailVerificationOTP: otp,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired verification OTP" }, { status: 400 })
    }

    // Verify the email
    user.isEmailVerified = true
    user.emailVerificationOTP = null
    user.emailVerificationExpires = null
    await user.save()

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 400 })
    }

    // Generate new verification OTP
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString() 
    user.emailVerificationOTP = verificationOTP
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000
    await user.save()

    // Send verification email with OTP
    await sendEmailVerification(email, user.fullName, verificationOTP)

    return NextResponse.json({ message: "Verification email sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}