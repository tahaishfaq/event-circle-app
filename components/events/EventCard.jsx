"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Share2, DollarSign } from "lucide-react"
import { format } from "date-fns"

export default function EventCard({ event }) {
  const { data: session } = useSession()
  const [showAttendees, setShowAttendees] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.eventName,
          text: event.eventDescription,
          url: `${window.location.origin}/events/${event._id}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/events/${event._id}`)
      alert("Event link copied to clipboard!")
    }
  }

  const handleBuyTicket = () => {
    if (!session) {
      alert("Please login to buy tickets")
      return
    }
    // Redirect to payment page
    window.location.href = `/events/${event._id}/purchase`
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <video className="w-full h-64 object-contain" poster={event.videoThumbnail} controls preload="metadata">
          <source src={event.eventVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {event.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold line-clamp-2">{event.eventName}</h3>
          <Button variant="ghost" size="sm" onClick={handleShare} className="p-1 h-auto">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(event.eventDate), "MMM dd, yyyy")}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {event.eventTime} ({event.duration})
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {event?.eventLocation?.address}
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />${event.ticketPrice}
          </div>
        </div>

        <p className="text-sm text-gray-700 line-clamp-3 mb-4">{event.eventDescription}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={event.creator?.profilePicture || "/placeholder.svg"} />
              <AvatarFallback>{event.creator?.fullName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <Link href={`/profile/${event.creator?.username}`} className="text-sm font-medium hover:underline">
              {event.creator?.fullName}
            </Link>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            {event.attendees?.length || 0}/{event.capacity}
          </div>
        </div>

        {event.attendees && event.attendees.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-2">Attendees:</span>
              <div className="flex -space-x-2">
                {event.attendees.slice(0, 5).map((attendee, index) => (
                  <Avatar
                    key={index}
                    className="h-6 w-6 border-2 border-white cursor-pointer"
                    onClick={() => setShowAttendees(true)}
                  >
                    <AvatarImage src={attendee.user?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{attendee.user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                ))}
                {event.attendees.length > 5 && (
                  <div
                    className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center cursor-pointer"
                    onClick={() => setShowAttendees(true)}
                  >
                    <span className="text-xs font-medium">+{event.attendees.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleBuyTicket} className="flex-1" disabled={event.attendees?.length >= event.capacity}>
            {event.attendees?.length >= event.capacity ? "Sold Out" : "Buy Ticket"}
          </Button>
          <Link href={`/events/${event._id}`}>
            <Button variant="outline">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
