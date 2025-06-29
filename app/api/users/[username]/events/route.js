import { NextResponse } from "next/server";
import User from "@/models/User";
import Event from "@/models/Event";
import { connectDB } from "@/lib/mongodb";

export async function GET(request, { params }) {
  const { username } = await params;

  try {
    await connectDB();

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const events = await Event.find({ creator: user._id })
      .populate("creator", "fullName username profilePicture")
      .populate("attendees.user", "fullName username profilePicture")
      .lean();

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
