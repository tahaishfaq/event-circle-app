import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      username,
      phoneNumber,
      dateOfBirth,
      gender,
      profilePicture,
    } = body;

    await connectDB();

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      username,
      _id: { $ne: session.user.id },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        fullName,
        username,
        phoneNumber,
        dateOfBirth,
        gender,
        profilePicture,
      },
      { new: true, select: "-password" }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
