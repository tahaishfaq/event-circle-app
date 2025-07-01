"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard } from "lucide-react"

export default function PaystackPayment({ event }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (!session) {
      alert("Please login to purchase tickets")
      return
    }

    setLoading(true)

    try {
      // Initialize Paystack payment
      const response = await axios.post("/api/payment/initialize", {
        eventId: event._id,
        amount: event.ticketPrice,
        email: session.user.email,
      })

      const { authorization_url, reference } = response.data

      // Redirect to Paystack payment page
      window.location.href = authorization_url
    } catch (error) {
      console.error("Payment initialization error:", error)
      alert("Failed to initialize payment. Please try again.")
      setLoading(false)
    }
  }

  const adminCut = (event.ticketPrice * 0.13).toFixed(2)
  const creatorAmount = (event.ticketPrice * 0.87).toFixed(2)

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Purchase Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">{event.eventName}</h3>
          <p className="text-sm text-gray-600 mb-2">{event.eventLocation}</p>
          <p className="text-sm text-gray-600">
            {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Ticket Price:</span>
            <span className="font-semibold">${event.ticketPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Platform Fee (13%):</span>
            <span>R{adminCut}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Creator Receives:</span>
            <span>R{creatorAmount}</span>
          </div>
          <hr />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>R{event.ticketPrice}</span>
          </div>
        </div>

        <Button onClick={handlePayment} className="w-full" disabled={loading}>
          {loading ? (
            "Processing..."
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Pay with Paystack
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">Secure payment powered by Paystack</p>
      </CardContent>
    </Card>
  )
}
