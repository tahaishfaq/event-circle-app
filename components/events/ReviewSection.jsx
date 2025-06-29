"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, Edit } from "lucide-react";
import moment from "moment";

export default function ReviewSection({ eventId, eventDate }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState("");
  const isPastEvent = new Date(eventDate) < new Date();

  useEffect(() => {
    fetchReviews();
  }, [eventId, status]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${eventId}/reviews`);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setRatingDistribution(response.data.ratingDistribution);

      // Find user's review if authenticated
      if (status === "authenticated" && session?.user) {
        const userReviewData = response.data.reviews.find(
          (review) => review.user._id === session.user.id
        );
        setUserReview(userReviewData);
        if (userReviewData) {
          setNewRating(userReviewData.rating);
          setNewReviewText(userReviewData.review);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newRating || !newReviewText.trim()) {
      toast({
        variant: "warning",
        title: "Warning",
        description: "Please provide both rating and review",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`/api/events/${eventId}/reviews`, {
        rating: newRating,
        review: newReviewText.trim(),
      });

      toast({
        title: "Success",
        description: userReview
          ? "Review updated successfully"
          : "Review submitted successfully",
      });

      setShowReviewDialog(false);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              readonly ? "" : "cursor-pointer"
            } transition-colors ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            aria-label={
              readonly
                ? `${star} star${star > 1 ? "s" : ""}`
                : `Rate ${star} star${star > 1 ? "s" : ""}`
            }
            aria-hidden={readonly ? "true" : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading || status === "loading") {
    return (
      <Card id="reviews">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="reviews">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" aria-hidden="true" />
            Reviews & Ratings
          </CardTitle>

          {status === "authenticated" && isPastEvent && (
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button
                  variant={userReview ? "outline" : "default"}
                  aria-label={
                    userReview ? "Edit your review" : "Write a review"
                  }
                >
                  {userReview ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                      Edit Review
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" aria-hidden="true" />
                      Write Review
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {userReview ? "Edit Your Review" : "Write a Review"}
                  </DialogTitle>
                  <DialogDescription>
                    Share your experience with other attendees
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="rating"
                    >
                      Rating
                    </label>
                    <StarRating
                      rating={newRating}
                      onRatingChange={setNewRating}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="review-text"
                    >
                      Review
                    </label>
                    <Textarea
                      id="review-text"
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Tell others about your experience..."
                      rows={4}
                      maxLength={1000}
                      aria-label="Write your review"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newReviewText.length}/1000 characters
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submitting}
                      className="flex-1"
                      aria-label={
                        submitting
                          ? "Submitting review"
                          : userReview
                          ? "Update review"
                          : "Submit review"
                      }
                    >
                      {submitting
                        ? "Submitting..."
                        : userReview
                        ? "Update Review"
                        : "Submit Review"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewDialog(false)}
                      aria-label="Cancel review"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {totalReviews === 0 ? (
          <div className="text-center py-8">
            <MessageSquare
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-gray-600">No reviews yet</p>
            {!isPastEvent && (
              <p className="text-sm text-gray-500 mt-2">
                Reviews will be available after the event
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(averageRating)} readonly />
                <p className="text-sm text-gray-600 mt-2">
                  Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <Progress
                      value={(ratingDistribution[rating] / totalReviews) * 100}
                      className="flex-1 h-2"
                      aria-label={`${rating} star rating progress`}
                    />
                    <span className="text-sm text-gray-600 w-8">
                      {ratingDistribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Recent Reviews</h4>
              {reviews.slice(0, 5).map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={review.user.profilePicture || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {review.user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">
                          {review.user.fullName}
                        </span>
                        <StarRating rating={review.rating} readonly />
                        {review.user._id === session?.user?.id && (
                          <Badge variant="outline" className="text-xs">
                            Your Review
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-700 mb-2">{review.review}</p>

                      <p className="text-xs text-gray-500">
                        {moment(review.createdAt).format("MMM DD, YYYY")}
                        {review.updatedAt !== review.createdAt && " (edited)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  aria-label="View all reviews"
                >
                  View All {totalReviews} Reviews
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
