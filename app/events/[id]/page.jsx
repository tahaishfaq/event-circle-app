"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/global/Navbar";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Share2,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
} from "lucide-react";
import moment from "moment";
import ReviewSection from "@/components/events/ReviewSection"

/**
 * EventDetailPage component for displaying event details
 * @returns {JSX.Element}
 */
export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllAttendees, setShowAllAttendees] = useState(false);


  const fetchEventDetails = useCallback(async () => {
    if (!params.id || event) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${params.id}`);
      setEvent(response.data);

      // Uncomment if follow status API is implemented
      if (session?.user?.id && response.data.creator) {
        const followResponse = await axios.get(
          `/api/users/${response.data.creator.username}/follow-status`
        );
        console.log("Follow status response:", followResponse.data);
        setIsFollowing(followResponse.data.isFollowing);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load event details",
      });
    } finally {
      setLoading(false);
    }
  }, [params.id, event, toast]);

  /**
   * Handle sharing the event
   */
  const handleShare = useCallback(async () => {
    const shareData = {
      title: event?.title,
      text: event?.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Success",
        description: "Event link copied to clipboard!",
      });
    }
  }, [event, toast]);

  /**
   * Handle ticket purchase
   */
  const handleBuyTicket = useCallback(() => {
    if (status !== "authenticated") {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to buy tickets",
      });
      router.push("/auth/login");
      return;
    }
    router.push(`/events/${params.id}/purchase`);
  }, [status, router, params.id, toast]);

  /**
   * Handle follow/unfollow event creator
   */
  const handleFollow = useCallback(async () => {
    if (status !== "authenticated") {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to follow users",
      });
      router.push("/auth/login");
      return;
    }

    try {
      if (isFollowing) {
        await axios.post(`/api/users/${event.creator.username}/unfollow`);
        setIsFollowing(false);
        toast({
          title: "Success",
          description: `Unfollowed ${event.creator.fullName}`,
        });
      } else {
        await axios.post(`/api/users/${event.creator.username}/follow`);
        setIsFollowing(true);
        toast({
          title: "Success",
          description: `Now following ${event.creator.fullName}`,
        });
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update follow status",
      });
    }
  }, [isFollowing, event, status, router, toast]);

  /**
   * Handle event deletion
   */
  const handleDeleteEvent = useCallback(async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`/api/events/${params.id}`);
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        router.push("/");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete event",
        });
      }
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"
              role="status"
              aria-label="Loading event details"
            ></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Event Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button aria-label="Back to events">Back to Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEventCreator = session?.user?.id === event.creator?._id;
  const isEventFull = event.attendees?.length >= event.capacity;
  const hasUserBoughtTicket = event.attendees?.some(
    (attendee) => attendee.user?._id === session?.user?.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Video */}
            <Card className="overflow-hidden">
              <div className="relative">
                <video
                  className="w-full h-64 md:h-96 object-contain"
                  poster={event.videoThumbnail}
                  controls
                  preload="metadata"
                  aria-label={`Video for ${event.title}`}
                >
                 <source src={event.eventVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {event.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    aria-label="Share event"
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </Card>

            

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl mb-2">
                      {event.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                        {moment(event.date).format("dddd, MMMM DD, YYYY")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
                        {event.eventTime} ({`${event.duration} hours`})
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
                        {event?.eventLocation?.address}
                      </div>
                    </div>
                  </div>
                  {isEventCreator && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        aria-label="Edit event"
                      >
                        <Link href={`/events/${params.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteEvent}
                        aria-label="Delete event"
                      >
                        <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      About This Event
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {event.description}
                    </p>
                    {event.additionalInfo && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">
                          Additional Information
                        </h4>
                        <p className="text-gray-600">{event.additionalInfo}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Event Restrictions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Event Requirements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Age Restriction:</span>
                        <Badge variant="outline" className="ml-2">
                          {event.ageRestrictions || "None"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Gender Restriction:</span>
                        <Badge variant="outline" className="ml-2">
                          {event.genderRestrictions === "all"
                            ? "All Genders"
                            : event.genderRestrictions || "None"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Attendees */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Attendees ({event.attendees?.length || 0}/
                        {event.capacity})
                      </h3>
                      {event.attendees && event.attendees.length > 6 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllAttendees(!showAllAttendees)}
                          aria-label={
                            showAllAttendees ? "Show fewer attendees" : "Show all attendees"
                          }
                        >
                          {showAllAttendees ? "Show Less" : "Show All"}
                        </Button>
                      )}
                    </div>

                    {event.attendees && event.attendees.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(showAllAttendees
                          ? event.attendees
                          : event.attendees.slice(0, 6)
                        ).map((attendee, index) => (
                          <div
                            key={attendee.user?._id || index}
                            className="flex items-center space-x-2"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  attendee.user?.profilePicture ||
                                  "/placeholder.svg"
                                }
                                alt={`${attendee.user?.fullName}'s profile picture`}
                              />
                              <AvatarFallback className="text-xs">
                                {attendee.user?.fullName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <Link
                              href={`/profile/${attendee.user?.username}`}
                              className="text-sm hover:underline truncate"
                              aria-label={`View ${attendee.user?.fullName}'s profile`}
                            >
                              {attendee.user?.fullName}
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No attendees yet. Be the first to join!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
                    <span>{event.eventLocation?.address}</span>
                  </div>

                  <div className="flex flex-col items-start w-full">
                    <iframe
                      className="w-full rounded-lg h-60 sm:h-96"
                      src={`https://maps.google.com/maps?q=${event.eventLocation.coordinates.lat},${event.eventLocation.coordinates.lng}&hl=en&z=14&output=embed`}
                      allowFullScreen=""
                      loading="lazy"
                      title="Event Location"
                    ></iframe>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" aria-hidden="true" />
                  Ticket Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    R{event.ticketPrice}
                  </div>
                  <p className="text-sm text-gray-600">per ticket</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span className="font-medium">
                      {event.capacity - (event.attendees?.length || 0)} /{" "}
                      {event.capacity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (13%):</span>
                    <span>R{(event.ticketPrice * 0.13).toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                {hasUserBoughtTicket ? (
                  <div className="text-center">
                    <Badge variant="default" className="mb-2">
                      Ticket Purchased
                    </Badge>
                    <p className="text-sm text-gray-600">
                      You're attending this event!
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleBuyTicket}
                    className="w-full"
                    disabled={isEventFull || isEventCreator}
                    size="lg"
                    aria-label={
                      isEventFull
                        ? "Event sold out"
                        : isEventCreator
                        ? "Your event"
                        : "Buy ticket"
                    }
                  >
                    {isEventFull
                      ? "Sold Out"
                      : isEventCreator
                      ? "Your Event"
                      : "Buy Ticket"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Event Creator Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={event.creator?.profilePicture || "/placeholder.svg"}
                      alt={`${event.creator?.fullName}'s profile picture`}
                    />
                    <AvatarFallback>
                      {event.creator?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link
                      href={`/profile/${event.creator?.username}`}
                      className="font-semibold hover:underline"
                      aria-label={`View ${event.creator?.fullName}'s profile`}
                    >
                      {event.creator?.fullName}
                    </Link>
                    <p className="text-sm text-gray-600">
                      @{event.creator?.username}
                    </p>
                  </div>
                </div>

                {!isEventCreator && status === "authenticated" && (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className="w-full"
                    aria-label={isFollowing ? "Unfollow creator" : "Follow creator"}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" aria-hidden="true" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Event Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium">
                    {moment(event.createdAt).format("MMM DD, YYYY")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge variant="secondary">{event.category}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Capacity:</span>
                  <span className="text-sm font-medium">
                    {event.capacity} people
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium">{`${event.duration} hours`}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 mt-8">
            <ReviewSection eventId={params.id} eventDate={event.eventDate} />
          </div>
        </div>
      </main>
    </div>
  );
}