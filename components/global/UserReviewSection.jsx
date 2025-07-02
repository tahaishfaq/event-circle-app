"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Edit, Trash2, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UserReviewSection({ username, userId }) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [username])

  const fetchReviews = async (pageNum = 1) => {
    try {
      const { data } = await axios.get(`/api/users/${username}/reviews`, {
        params: { page: pageNum, limit: 10 },
      })
      setReviews((prev) => (pageNum === 1 ? data.reviews : [...prev, ...data.reviews]))
      setStats(data.stats)
      setHasMore(data.pagination.hasNextPage)
      setPage(pageNum)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!session) {
      toast({ title: "Login required", description: "Please login first.", variant: "destructive" })
      return
    }
    if (comment.trim().length < 10) {
      toast({ title: "Comment too short", description: "Minimum 10 characters.", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const { data } = await axios.post(`/api/users/${username}/reviews`, { rating, comment })
      toast({ title: "Success", description: data.message })
      setShowReviewForm(false)
      setComment("")
      setRating(5)
      fetchReviews()
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to submit", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReview = async (reviewId) => {
    setSubmitting(true)
    try {
      const { data } = await axios.put(`/api/reviews/${reviewId}`, { rating, comment })
      toast({ title: "Updated", description: data.message })
      setEditingReview(null)
      setComment("")
      setRating(5)
      fetchReviews()
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.error || "Update failed", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      const { data } = await axios.delete(`/api/reviews/${reviewId}`)
      toast({ title: "Deleted", description: data.message })
      fetchReviews()
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.error || "Delete failed", variant: "destructive" })
    }
  }

  const renderStars = (rating, interactive = false, onRatingChange = null) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} ${
            interactive ? "cursor-pointer hover:text-yellow-400" : ""
          }`}
          onClick={interactive ? () => onRatingChange(star) : undefined}
        />
      ))}
    </div>
  )

  const canReview = session?.user?.id && session.user.id !== userId

  if (loading) {
    return (
      <Card><CardContent className="p-6"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="space-y-2"><div className="h-4 bg-gray-200 rounded"></div><div className="h-4 bg-gray-200 rounded w-5/6"></div></div></div></CardContent></Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Reviews ({stats.totalReviews || 0})</CardTitle>
          {canReview && (
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
              <DialogTrigger asChild><Button>Write Review</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Write a Review</DialogTitle><DialogDescription>Share your experience</DialogDescription></DialogHeader>
                <div className="space-y-4">
                  <div><label className="text-sm font-medium">Rating</label>{renderStars(rating, true, setRating)}</div>
                  <div><label className="text-sm font-medium">Comment</label><Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} /><p className="text-xs text-gray-500 mt-1">Minimum 10 characters ({comment.length}/500)</p></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button><Button onClick={handleSubmitReview} disabled={submitting || comment.trim().length < 10}>{submitting ? "Submitting..." : "Submit Review"}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {stats.totalReviews > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">{renderStars(Math.round(stats.averageRating))}<span className="font-medium">{stats.averageRating}</span></div>
            <div className="flex gap-2">{Object.entries(stats.ratingDistribution).map(([r, c]) => (<Badge key={r} variant="secondary" className="text-xs">{r}★ ({c})</Badge>))}</div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet</p>
            {canReview && <p className="text-sm">Be the first to leave a review!</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10"><AvatarImage src={review.reviewer.profilePicture || "/placeholder.svg"} /><AvatarFallback>{review.reviewer.fullName.charAt(0)}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{review.reviewer.fullName}</h4>
                        <span className="text-sm text-gray-500">@{review.reviewer.username}</span>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}{review.updatedAt !== review.createdAt && " (edited)"}</p>
                    </div>
                  </div>
                  {session?.user?.id === review.reviewer._id && (
                    <div className="flex gap-1">
                      <Dialog open={editingReview === review._id} onOpenChange={(open) => !open && setEditingReview(null)}>
                        <DialogTrigger asChild><Button variant="ghost" size="sm" onClick={() => { setEditingReview(review._id); setRating(review.rating); setComment(review.comment); }}><Edit className="w-4 h-4" /></Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Edit Review</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div><label className="text-sm font-medium">Rating</label>{renderStars(rating, true, setRating)}</div>
                            <div><label className="text-sm font-medium">Comment</label><Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} /></div>
                          </div>
                          <DialogFooter><Button variant="outline" onClick={() => setEditingReview(null)}>Cancel</Button><Button onClick={() => handleEditReview(review._id)} disabled={submitting}>{submitting ? "Updating..." : "Update"}</Button></DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete Review</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteReview(review._id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {hasMore && (<div className="text-center pt-4"><Button variant="outline" onClick={() => fetchReviews(page + 1)}>Load More Reviews</Button></div>)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
