import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import Event from "@/models/Event"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    await connectDB()

    const events = await Event.find({})
      .populate("creator", "fullName username profilePicture")
      .populate("attendees.user", "fullName username profilePicture")
      .sort({ createdAt: -1 })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    await connectDB()

    const event = await Event.create({
      ...body,
      creator: session.user.id,
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
