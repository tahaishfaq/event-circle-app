
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Navbar from "@/components/global/Navbar";
import BankSetup from "@/components/finance/BankSetup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Calendar, Users, AlertCircle, MapPin } from "lucide-react";
import moment from "moment";

export default function FinancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasSubaccount, setHasSubaccount] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    totalTicketsSold: 0,
    activeEvents: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      checkSubaccountStatus();
      fetchEarnings();
    }
  }, [status]);

  const checkSubaccountStatus = async () => {
    try {
      const response = await axios.get("/api/paystack/subaccount");
      console.log("Subaccount status response:", response.data);
      setHasSubaccount(response.data.hasSubaccount);
    } catch (error) {
      console.error("Error checking subaccount:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check payment account status",
      });
    }
  };

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/finance/earnings");
      setEarnings(response.data.earnings);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load earnings data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setHasSubaccount(true);
    toast({
      title: "Success",
      description: "Payment account set up successfully! You can now receive payments from ticket sales.",
    });
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
              aria-label="Loading finance data"
            ></div>
            <p className="mt-4 text-gray-600">Loading finance data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600">Track your earnings from event ticket sales</p>
        </div>

        {!hasSubaccount ? (
          <div className="mb-8">
            <BankSetup onComplete={handleSetupComplete} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.thisMonthEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalTicketsSold}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Events</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-blue-800">How Payments Work</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      When someone buys a ticket for your event, Paystack automatically splits the payment: 87% goes
                      directly to your bank account, and 13% is kept by the platform as a service fee. Payments are
                      typically settled within 24 hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="earnings" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="earnings" aria-label="View earnings history">Earnings History</TabsTrigger>
              </TabsList>

              <TabsContent value="earnings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {earnings.length === 0 ? (
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                        <p className="text-gray-600">No earnings yet</p>
                        <p className="text-sm text-gray-500">
                          Earnings will appear here when people buy tickets for your events
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {earnings.map((earning) => {
                          const mapUrl = earning.event?.eventLocation?.coordinates
                            ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${earning.event.eventLocation.coordinates.lat},${earning.event.eventLocation.coordinates.lng}&zoom=15`
                            : null;

                          return (
                            <div key={earning._id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between space-x-4">
                                <div className="flex items-start space-x-4">
                                  <img
                                    src={earning.event?.videoThumbnail || "/placeholder.svg"}
                                    alt={earning.event?.eventName}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                  <div>
                                    <h3 className="font-semibold">{earning.event?.eventName}</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                      <p>
                                        {earning.quantity} ticket{earning.quantity > 1 ? "s" : ""} sold
                                      </p>
                                      <p>
                                        {moment(earning.purchaseDate).format("MMM DD, YYYY [at] h:mm a")}
                                      </p>
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
                                        <span>{earning.event?.eventLocation?.address}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-lg">${earning.creatorEarning.toFixed(2)}</p>
                                  <p className="text-sm text-gray-600">Total: ${earning.totalAmount.toFixed(2)}</p>
                                  <Badge variant="outline" className="mt-1">
                                    Settled
                                  </Badge>
                                </div>
                              </div>
                              {mapUrl && (
                                <div className="mt-4">
                                  <iframe
                                    className="w-full h-48 rounded-md"
                                    src={mapUrl}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Map for ${earning.event?.eventName}`}
                                  ></iframe>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
