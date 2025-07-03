// import { NextResponse } from "next/server"
// import bcrypt from "bcryptjs"
// import { connectDB } from "@/lib/mongodb"
// import User from "@/models/User"

// export async function POST(request) {
//   try {
//     const body = await request.json()
//     const { fullName, username, email, password, profilePicture, dateOfBirth, gender, phoneNumber } = body

//     await connectDB()

//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       return NextResponse.json({ message: "Username is already taken" }, { status: 400 });
//     }

//     // Check email next
//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return NextResponse.json({ message: "Email is already taken" }, { status: 400 });
//     }

//     if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
//       return NextResponse.json({ message: "Invalid date of birth" }, { status: 400 });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12)

//     // Create user
//     const user = await User.create({
//       fullName,
//       username,
//       email,
//       password: hashedPassword,
//       profilePicture,
//       dateOfBirth,
//       gender,
//       phoneNumber,
//     })

//     return NextResponse.json({ message: "User created successfully", userId: user._id }, { status: 201 })
//   } catch (error) {
//     console.error("Registration error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { sendEmailVerification } from "../../../../lib/emailService"


export async function POST(request) {
  try {
    const body = await request.json()
    const { fullName, username, email, password, profilePicture, dateOfBirth, gender, phoneNumber } = body

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    await connectDB()

    // Check for existing username
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 400 })
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return NextResponse.json({ message: "Email is already taken" }, { status: 400 })
    }

    // Validate date of birth
    if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
      return NextResponse.json({ message: "Invalid date of birth" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      profilePicture,
      dateOfBirth,
      gender,
      phoneNumber,
      isEmailVerified: false,
    })

    // Generate and save OTP
    const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString() 
    user.emailVerificationOTP = verificationOTP
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000
    await user.save()

    // Send verification email
    await sendEmailVerification(email, fullName, verificationOTP)

    return NextResponse.json(
      { message: "User created successfully. Please check your email for the verification OTP.", userId: user._id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
