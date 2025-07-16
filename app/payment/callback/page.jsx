
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useSession } from "next-auth/react";
// import axios from "axios";
// import Link from "next/link";
// import Navbar from "@/components/global/Navbar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
// import { CheckCircle, XCircle, Loader2, Calendar, MapPin, Clock } from "lucide-react";
// import moment from "moment";

// export default function PaymentCallbackPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { data: session, status } = useSession();
//   const { toast } = useToast();
//   const [statusState, setStatus] = useState("verifying"); // verifying, success, failed
//   const [paymentData, setPaymentData] = useState(null);
//   const [eventData, setEventData] = useState(null);

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/auth/login");
//       return;
//     }

//     if (status === "authenticated") {
//       const reference = searchParams.get("reference") || searchParams.get("trxref");
//       if (reference) {
//         verifyPayment(reference);
//       } else {
//         setStatus("failed");
//         toast({
//           variant: "destructive",
//           title: "Error",
//           description: "Invalid payment reference",
//         });
//       }
//     }
//   }, [status, searchParams]);

//   const verifyPayment = async (reference) => {
//     try {
//       const response = await axios.post("/api/payment/verify", { reference });

//       if (response.data.success) {
//         setStatus("success");
//         setPaymentData(response.data.payment);
//         setEventData(response.data.event);
//         toast({
//           title: "Success",
//           description: "Payment successful! Your ticket has been confirmed.",
//         });
//       } else {
//         setStatus("failed");
//         toast({
//           variant: "destructive",
//           title: "Error",
//           description: response.data.message || "Payment verification failed",
//         });
//       }
//     } catch (error) {
//       console.error("Payment verification error:", error);
//       setStatus("failed");
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Payment verification failed. Please contact support.",
//       });
//     }
//   };


//   const renderContent = () => {
//     switch (statusState) {
//       case "verifying":
//         return (
//           <Card className="max-w-md mx-auto">
//             <CardContent className="pt-6">
//               <div className="text-center space-y-4">
//                 <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" aria-hidden="true" />
//                 <h2 className="text-xl font-semibold">Verifying Payment</h2>
//                 <p className="text-gray-600">Please wait while we confirm your payment...</p>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case "success":
//         return (
//           <div className="max-w-2xl mx-auto space-y-6">
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-center space-y-4">
//                   <CheckCircle className="h-16 w-16 text-green-600 mx-auto" aria-hidden="true" />
//                   <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
//                   <p className="text-gray-600">
//                     Your ticket has been confirmed. You'll receive a confirmation email shortly.
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {eventData && (
//               <>
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Event Details</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex items-start space-x-4">
//                       <img
//                         src={eventData.videoThumbnail || "/placeholder.svg"}
//                         alt={eventData.eventName}
//                         className="w-24 h-24 rounded-lg object-cover"
//                       />
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold mb-2">{eventData.eventName}</h3>
//                         <div className="space-y-1 text-sm text-gray-600">
//                           <div className="flex items-center">
//                             <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
//                             {moment(eventData.eventDate).format("dddd, MMMM DD, YYYY")}
//                           </div>
//                           <div className="flex items-center">
//                             <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
//                             {eventData.eventTime} ({eventData.duration})
//                           </div>
//                           <div className="flex items-center">
//                             <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
//                             {eventData.eventLocation.address}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//               </>
//             )}

//             {paymentData && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Payment Summary</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span>Transaction ID:</span>
//                       <span className="font-mono text-sm">{paymentData.reference}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Amount Paid:</span>
//                       <span className="font-semibold">${(paymentData.amount / 100).toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Payment Date:</span>
//                       <span>{moment(paymentData.paid_at).format("MMM DD, YYYY [at] h:mm a")}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Status:</span>
//                       <span className="text-green-600 font-semibold">Confirmed</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             <div className="flex space-x-4 justify-center">
//               <Link href={eventData ? `/events/${eventData._id}` : "/"} aria-label="View event details">
//                 <Button>View Event</Button>
//               </Link>
//               <Link href="/profile" aria-label="Go to my profile">
//                 <Button variant="outline">My Profile</Button>
//               </Link>
//             </div>
//           </div>
//         );

//       case "failed":
//         return (
//           <Card className="max-w-md mx-auto">
//             <CardContent className="pt-6">
//               <div className="text-center space-y-4">
//                 <XCircle className="h-16 w-16 text-red-600 mx-auto" aria-hidden="true" />
//                 <h2 className="text-xl font-semibold text-red-600">Payment Failed</h2>
//                 <p className="text-gray-600">
//                   Your payment could not be processed. Please try again or contact support.
//                 </p>
//                 <div className="flex space-x-4 justify-center">
//                   <Button onClick={() => router.back()} aria-label="Try payment again">Try Again</Button>
//                   <Link href="/" aria-label="Go to homepage">
//                     <Button variant="outline">Go Home</Button>
//                   </Link>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8 text-center">
//           <h1 className="text-3xl font-bold text-gray-900">Payment Status</h1>
//         </div>
//         {renderContent()}
//       </main>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/components/global/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Calendar, MapPin, Clock } from "lucide-react";
import moment from "moment";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [statusState, setStatus] = useState("verifying"); // verifying, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      const reference = searchParams.get("reference") || searchParams.get("trxref");
      if (!reference) {
        setStatus("failed");
        setErrorMessage("Invalid payment reference");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid payment reference",
        });
        return;
      }
      verifyPayment(reference);
    }
  }, [status, searchParams, router, toast]);

  const verifyPayment = async (reference) => {
    try {
      console.log("Verifying payment with reference:", reference);
      const response = await axios.post("/api/payment/verify", { reference }, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Verification response:", response.data);

      if (response.data.success) {
        setStatus("success");
        setPaymentData(response.data.payment);
        setEventData(response.data.event);
        toast({
          title: "Success",
          description: "Payment successful! Your ticket has been confirmed. A confirmation email will be sent shortly.",
        });
      } else {
        setStatus("failed");
        setErrorMessage(response.data.message || "Payment verification failed");
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Payment verification failed",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error.response?.data || error.message);
      setStatus("failed");
      setErrorMessage(
        error.response?.data?.message || error.message || "Payment verification failed. Please contact support."
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Payment verification failed. Please contact support.",
      });
    }
  };

  const renderContent = () => {
    switch (statusState) {
      case "verifying":
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" aria-hidden="true" />
                <h2 className="text-xl font-semibold">Verifying Payment</h2>
                <p className="text-gray-600">Please wait while we confirm your payment...</p>
              </div>
            </CardContent>
          </Card>
        );

      case "success":
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto" aria-hidden="true" />
                  <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                  <p className="text-gray-600">
                    Your ticket has been confirmed. A confirmation email will be sent shortly (check your spam/junk folder if not received).
                  </p>
                </div>
              </CardContent>
            </Card>

            {eventData && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <img
                      src={eventData.videoThumbnail || "/placeholder.svg"}
                      alt={eventData.eventName}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{eventData.eventName}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                          {moment(eventData.eventDate).format("dddd, MMMM DD, YYYY")}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
                          {eventData.eventTime} ({eventData.duration})
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
                          {eventData.eventLocation.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentData && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-sm">{paymentData.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span className="font-semibold">${(paymentData.amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Date:</span>
                      <span>{moment(paymentData.paid_at).format("MMM DD, YYYY [at] h:mm a")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-semibold">Confirmed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-4 justify-center">
              <Link href={eventData ? `/events/${eventData._id}` : "/"} aria-label="View event details">
                <Button>View Event</Button>
              </Link>
              <Link href="/profile" aria-label="Go to my profile">
                <Button variant="outline">My Profile</Button>
              </Link>
            </div>
          </div>
        );

      case "failed":
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <XCircle className="h-16 w-16 text-red-600 mx-auto" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-red-600">Payment Failed</h2>
                <p className="text-gray-600">
                  {errorMessage || "Your payment could not be processed. Please try again or contact support."}
                </p>
                <div className="flex space-x-4 justify-center">
                  <Button onClick={() => router.back()} aria-label="Try payment again">Try Again</Button>
                  <Link href="/" aria-label="Go to homepage">
                    <Button variant="outline">Go Home</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Payment Status</h1>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}