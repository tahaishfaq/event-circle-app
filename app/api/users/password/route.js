import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    await connectDB()

    // Get user with password
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await User.findByIdAndUpdate(session.user.id, {
      password: hashedNewPassword,
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
