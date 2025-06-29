import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request) {
  try {
    const body = await request.json()
    const { fullName, username, email, password, profilePicture, dateOfBirth, gender, phoneNumber } = body

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email or username already exists" }, { status: 400 })
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
