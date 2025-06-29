"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/components/global/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CreditCard,
  Shield,
  ArrowLeft,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import moment from "moment";

export default function PurchaseTicketPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchEventDetails();
    }
  }, [params.id, status]);

  useEffect(() => {
    if (session?.user) {
      setContactInfo({
        email: session.user.email || "",
        phone: session.user.phoneNumber || "",
      });
    }
  }, [session]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${params.id}`);
      const eventData = response.data;
      console.log("Fetched event data:", eventData);

      // Check if user already bought a ticket
      const hasTicket = eventData.attendees?.some(
        (attendee) => attendee.user._id === session?.user?.id
      );
      if (hasTicket) {
        toast({
          title: "Info",
          description: "You already have a ticket for this event",
        });
        router.push(`/events/${params.id}`);
        return;
      }

      // Check if event is full
      if (eventData.attendees?.length >= eventData.capacity) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "This event is sold out",
        });
        router.push(`/events/${params.id}`);
        return;
      }

      // Check if user is the creator
      if (eventData.creator._id === session?.user?.id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You cannot buy a ticket for your own event",
        });
        router.push(`/events/${params.id}`);
        return;
      }

      setEvent(eventData);
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load event details",
      });
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!agreeToTerms) {
      toast({
        variant: "warning",
        title: "Warning",
        description: "Please agree to the terms and conditions",
      });
      return;
    }

    if (!contactInfo.email || !contactInfo.phone) {
      toast({
        variant: "warning",
        title: "Warning",
        description: "Please provide your contact information",
      });
      return;
    }

    // Check if event creator has set up payment account
    if (!event.creator.paystackSubaccountCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "The event creator hasn't set up their payment account yet. Please contact them.",
      });
      return;
    }

    setProcessing(true);

    try {
      // Initialize Paystack payment
      const response = await axios.post("/api/payment/initialize", {
        eventId: event._id,
        amount: event.ticketPrice * quantity,
        email: contactInfo.email,
        phone: contactInfo.phone,
        quantity: quantity,
        metadata: {
          eventName: event.eventName,
          eventDate: event.eventDate,
          eventLocation: event.eventLocation.address,
          buyerName: session.user.fullName,
          buyerUsername: session.user.username,
        },
      });

      const { authorization_url } = response.data;

      // Redirect to Paystack payment page
      window.location.href = authorization_url;
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to initialize payment. Please try again.",
      });
      setProcessing(false);
    }
  };

  const availableTickets = event
    ? event.capacity - (event.attendees?.length || 0)
    : 0;
  const maxQuantity = Math.min(availableTickets, 5);
  const subtotal = event ? event.ticketPrice * quantity : 0;
  const platformFee = subtotal * 0.13;
  const creatorAmount = subtotal * 0.87;
  const total = subtotal;

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
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
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Event Not Found
            </h1>
            <p className="text-gray-600">
              The event you're trying to purchase tickets for doesn't exist.
            </p>
            <Link href="/">
              <Button aria-label="Back to events">Back to Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/events/${params.id}`}>
            <Button variant="ghost" className="mb-4" aria-label="Back to event">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Tickets</h1>
          <p className="text-gray-600">
            Complete your ticket purchase for {event.eventName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!event.creator.paystackSubaccountCode && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Payment Setup Required:</strong> The event creator
                  hasn't set up their payment account yet. Ticket purchases are
                  currently unavailable for this event.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <img
                    src={event.videoThumbnail || "/placeholder.svg"}
                    alt={event.eventName}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {event.eventName}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {moment(event.eventDate).format("dddd, MMMM DD, YYYY")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.eventTime} ({event.duration})
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.eventLocation.address}
                      </div>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {event.category}
                    </Badge>
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

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            email: e.target.value,
                          })
                        }
                        className="pl-10"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            phone: e.target.value,
                          })
                        }
                        className="pl-10"
                        placeholder="+1 123 456 7890"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    We'll send your ticket confirmation and invoice to this
                    email and phone number.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Number of Tickets</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        aria-label="Decrease ticket quantity"
                      >
                        -
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.min(
                              maxQuantity,
                              Math.max(1, Number.parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setQuantity(Math.min(maxQuantity, quantity + 1))
                        }
                        disabled={quantity >= maxQuantity}
                        aria-label="Increase ticket quantity"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {availableTickets} tickets available • Maximum 5 per
                      purchase
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ticket Price</span>
                    <span>${event.ticketPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span>×{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Platform Fee (13%)</span>
                      <span>${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Creator Receives (87%)</span>
                      <span>${creatorAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={setAgreeToTerms}
                    aria-label="Agree to terms and conditions"
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions
                    </Label>
                    <p className="text-xs text-gray-600">
                      By purchasing this ticket, you agree to our{" "}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      . All sales are final.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  className="w-full"
                  size="lg"
                  disabled={
                    processing ||
                    !agreeToTerms ||
                    !event.creator.paystackSubaccountCode
                  }
                  aria-label="Pay with Paystack"
                >
                  {processing ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with Paystack
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment powered by Paystack</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={event.creator?.profilePicture || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {event.creator?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/profile/${event.creator?.username}`}
                      className="font-medium hover:underline"
                      aria-label={`View ${event.creator?.fullName}'s profile`}
                    >
                      {event.creator?.fullName}
                    </Link>
                    <p className="text-sm text-gray-600">
                      @{event.creator?.username}
                    </p>
                    {event.creator.paystackSubaccountCode && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Payment Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
