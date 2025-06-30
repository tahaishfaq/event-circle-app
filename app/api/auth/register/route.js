import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request) {
  try {
    const body = await request.json()
    const { fullName, username, email, password, profilePicture, dateOfBirth, gender, phoneNumber } = body

    await connectDB()

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 400 });
    }

    // Check email next
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ message: "Email is already taken" }, { status: 400 });
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
    })

    return NextResponse.json({ message: "User created successfully", userId: user._id }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
