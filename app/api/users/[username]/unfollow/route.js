import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request, { params }) {
  try {
    const { username } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const userToUnfollow = await User.findOne({ username: username })
    const currentUser = await User.findById(session.user.id)

    if (!userToUnfollow || !currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Remove from following and followers
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: userToUnfollow._id },
    })

    await User.findByIdAndUpdate(userToUnfollow._id, {
      $pull: { followers: currentUser._id },
    })

    return NextResponse.json({ message: "Successfully unfollowed user" })
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
