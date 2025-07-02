import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import UserReview from "@/models/UserReview";
import User from "@/models/User";
import mongoose from "mongoose";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 10;

    // Find the user being reviewed
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    const reviews = await UserReview.find({ reviewee: user._id })
      .populate("reviewer", "fullName username profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await UserReview.countDocuments({
      reviewee: user._id,
    });
    const totalPages = Math.ceil(totalReviews / limit);

    // Calculate average rating
    const ratingStats = await UserReview.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(user._id) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    let averageRating = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (ratingStats.length > 0) {
      averageRating = ratingStats[0].averageRating;
      ratingStats[0].ratingDistribution.forEach((rating) => {
        ratingDistribution[rating]++;
      });
    }

    return NextResponse.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { username } = params;
    const { rating, comment } = await request.json();

    // Validate input
    if (!rating || !comment || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating or comment" },
        { status: 400 }
      );
    }

    // Find the user being reviewed
    const reviewee = await User.findOne({ username });
    if (!reviewee) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-review
    if (reviewee._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot review yourself" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this person
    const existingReview = await UserReview.findOne({
      reviewer: session.user.id,
      reviewee: reviewee._id,
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.updatedAt = new Date();
      await existingReview.save();

      const populatedReview = await UserReview.findById(
        existingReview._id
      ).populate("reviewer", "fullName username profilePicture");

      // Update user's average rating
      await updateUserRating(reviewee._id);

      return NextResponse.json(populatedReview);
    } else {
      // Create new review
      const review = new UserReview({
        reviewer: session.user.id,
        reviewee: reviewee._id,
        rating,
        comment,
      });

      await review.save();

      const populatedReview = await UserReview.findById(review._id).populate(
        "reviewer",
        "fullName username profilePicture"
      );

      // Update user's average rating
      await updateUserRating(reviewee._id);

      return NextResponse.json(populatedReview, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating/updating user review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to update user's average rating
async function updateUserRating(userId) {
  const stats = await UserReview.aggregate([
    { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
  const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

  await User.findByIdAndUpdate(userId, {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  });
}
