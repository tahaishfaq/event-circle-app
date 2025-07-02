import mongoose from "mongoose"

const UserReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Ensure one review per reviewer-reviewee pair
UserReviewSchema.index({ reviewer: 1, reviewee: 1 }, { unique: true })

export default mongoose.models.UserReview || mongoose.model("UserReview", UserReviewSchema)
