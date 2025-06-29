import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/mongodb"
import Event from "@/models/Event"
import Review from "@/models/Review"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const reviews = await Review.find({ event: await params.id })
      .populate("user", "fullName username profilePicture")
      .sort({ createdAt: -1 })

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Rating distribution
    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    }

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { rating, review } = await request.json()

    if (!rating || !review || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid rating or review" }, { status: 400 })
    }

    await connectDB()

    // Check if event exists
    const event = await Event.findById(params.id)
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }

    // Check if user attended the event
    const hasAttended = event.attendees.some((attendee) => attendee.user.toString() === session.user.id)

    if (!hasAttended) {
      return NextResponse.json(
        {
          message: "You can only review events you have attended",
        },
        { status: 403 },
      )
    }

    // Check if event has already happened
    if (new Date(event.eventDate) > new Date()) {
      return NextResponse.json(
        {
          message: "You can only review events that have already happened",
        },
        { status: 400 },
      )
    }

    // Create or update review
    const existingReview = await Review.findOne({
      event: params.id,
      user: session.user.id,
    })

    if (existingReview) {
      existingReview.rating = rating
      existingReview.review = review
      existingReview.updatedAt = new Date()
      await existingReview.save()

      const populatedReview = await Review.findById(existingReview._id).populate(
        "user",
        "fullName username profilePicture",
      )

      return NextResponse.json({
        message: "Review updated successfully",
        review: populatedReview,
      })
    } else {
      const newReview = await Review.create({
        event: params.id,
        user: session.user.id,
        rating,
        review,
      })

      const populatedReview = await Review.findById(newReview._id).populate("user", "fullName username profilePicture")

      return NextResponse.json(
        {
          message: "Review created successfully",
          review: populatedReview,
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Error creating/updating review:", error)

    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: "You have already reviewed this event",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
