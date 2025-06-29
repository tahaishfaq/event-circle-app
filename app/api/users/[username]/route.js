// app/api/users/[username]/route.js
import { NextResponse } from "next/server";
import  { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/users/:username
export async function GET(request, { params }) {
  const { username } = await params;

  try {
    await connectDB();

    const user = await User.findOne({ username })
      .populate("followers", "fullName username profilePicture")
      .populate("following", "fullName username profilePicture")
      .lean()
      .select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
