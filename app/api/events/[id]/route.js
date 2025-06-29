import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const event = await Event.findById(id)
      .populate("creator", "fullName username profilePicture paystackSubaccountCode")
      .populate("attendees.user", "fullName username profilePicture");

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Check if user is the creator or admin
    if (
      event.creator.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Event.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Check if user is the creator or admin
    if (
      event.creator.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const updatedEvent = await Event.findByIdAndUpdate(params.id, body, {
      new: true,
    })
      .populate("creator", "fullName username profilePicture")
      .populate("attendees.user", "fullName username profilePicture");

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
