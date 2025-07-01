"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/components/global/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  Eye,
  Star,
  MessageSquare,
} from "lucide-react";
import moment from "moment";

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [upcomingTickets, setUpcomingTickets] = useState([]);
  const [pastTickets, setPastTickets] = useState([]);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchTickets();
    }
  }, [status]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/tickets");
      setUpcomingTickets(response.data.upcomingTickets);
      setPastTickets(response.data.pastTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tickets",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (ticketId, ticketNumber) => {
    try {
      setDownloading({ ...downloading, [ticketId]: true });
      const response = await axios.get(`/api/tickets/${ticketId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket-${ticketNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Ticket downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading ticket:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download ticket",
      });
    } finally {
      setDownloading({ ...downloading, [ticketId]: false });
    }
  };

  const TicketCard = ({ ticket, isPast = false }) => {
    return (
      <Card className="overflow-hidden">
        <div className="relative">
          <img
            src={ticket.event.videoThumbnail || "/placeholder.svg"}
            alt={ticket.event.eventName}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={isPast ? "secondary" : "default"}>
              {isPast ? "Attended" : "Upcoming"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {ticket.event.eventName}
          </h3>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
              {moment(ticket.event.eventDate).format("MMM DD, YYYY")}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
              {ticket.event.eventTime} ({ticket.event.duration})
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
              {ticket.event.eventLocation.address}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={
                    ticket.event.creator?.profilePicture || "/placeholder.svg"
                  }
                />
                <AvatarFallback className="text-xs">
                  {ticket.event.creator?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {ticket.event.creator?.fullName}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {ticket.event.category}
            </Badge>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Ticket Number:</span>
              <span className="font-mono font-medium">
                {ticket.ticketNumber}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold">
                ${ticket.amount?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Purchase Date:</span>
              <span>{moment(ticket.purchaseDate).format("MMM DD, YYYY")}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-y-3">
            <Button
              onClick={() =>
                handleDownloadTicket(ticket._id, ticket.ticketNumber)
              }
              disabled={downloading[ticket._id]}
              className="w-full"
              aria-label={
                downloading[ticket._id]
                  ? "Downloading ticket"
                  : "Download ticket PDF"
              }
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              {downloading[ticket._id] ? "Downloading..." : "Download PDF"}
            </Button>

            <div className="flex space-x-2">
              <Link
                href={`/events/${ticket.event._id}`}
                aria-label="View event details"
              >
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                  View Event
                </Button>
              </Link>

              {isPast && (
                <Link
                  href={`/events/${ticket.event._id}#reviews`}
                  aria-label="Review event"
                >
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-1" aria-hidden="true" />
                    Review
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"
              role="status"
              aria-label="Loading tickets"
            ></div>
            <p className="mt-4 text-gray-600">Loading your tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600">
            Manage and download your event tickets
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" aria-label="View upcoming events">
              Upcoming Events ({upcomingTickets.length})
            </TabsTrigger>
            <TabsTrigger value="past" aria-label="View past events">
              Past Events ({pastTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingTickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar
                    className="h-12 w-12 text-gray-400 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No upcoming events
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any tickets for upcoming events.
                  </p>
                  <Link href="/" aria-label="Browse events">
                    <Button>Browse Events</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTickets.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastTickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare
                    className="h-12 w-12 text-gray-400 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No past events
                  </h3>
                  <p className="text-gray-600">
                    You haven't attended any events yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTickets.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} isPast={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
