import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request, { params }) {
  try {
    const { username } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ isFollowing: false })
    }

    await connectDB()

    const userToCheck = await User.findOne({ username: username })
    const currentUser = await User.findById(session.user.id)

    if (!userToCheck || !currentUser) {
      return NextResponse.json({ isFollowing: false })
    }

    const isFollowing = currentUser.following.includes(userToCheck._id)

    return NextResponse.json({ isFollowing })
  } catch (error) {
    console.error("Error checking follow status:", error)
    return NextResponse.json({ isFollowing: false })
  }
}
