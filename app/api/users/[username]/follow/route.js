// app/api/users/[username]/follow/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(request, { params }) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const targetUser = await User.findOne({ username }).lean();
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      );
    }

    if (targetUser._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    if (currentUser.following.includes(targetUser._id)) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }

    await User.updateOne(
      { _id: targetUser._id },
      { $addToSet: { followers: currentUser._id } }
    );
    await User.updateOne(
      { _id: currentUser._id },
      { $addToSet: { following: targetUser._id } }
    );

    return NextResponse.json(
      { message: "Followed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}
