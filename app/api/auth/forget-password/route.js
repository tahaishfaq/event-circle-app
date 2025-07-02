import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTPEmail } from "@/lib/emailService";

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, you'll receive an OTP.",
        },
        { status: 200 }
      );
    }

    // Generate OTP and set expiry (10 minutes)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(user.email, user.fullName, otp);
      console.log(`OTP sent to ${user.email}: ${otp}`); // For development
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Continue anyway - OTP is saved in database
    }

    return NextResponse.json(
      {
        message: "If an account with that email exists, you'll receive an OTP.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
