"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Mail, Loader2, AlertCircle } from "lucide-react"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading") // loading, success, error, verify, resend
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [resending, setResending] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const messageParam = searchParams.get("message")

  useEffect(() => {
    if (messageParam) {
      setStatus("verify")
      setMessage(messageParam)
    } else {
      setStatus("verify")
      setMessage("Please enter the OTP sent to your email to verify your account.")
    }
  }, [messageParam])

  const verifyEmail = async (e) => {
    e.preventDefault()
    if (!otp) {
      setMessage("Please enter the OTP")
      setStatus("error")
      return
    }

    setStatus("loading")
    try {
      const response = await axios.get(`/api/auth/verify-email?otp=${otp}`)
      setStatus("success")
      setMessage(response.data.message)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login?message=Email verified successfully. You can now log in.")
      }, 3000)
    } catch (error) {
      setStatus("error")
      setMessage(error.response?.data?.message || "Email verification failed")
    }
  }

  const resendVerification = async (e) => {
    e.preventDefault()
    if (!email) {
      setMessage("Please enter your email address")
      setStatus("error")
      return
    }

    setResending(true)
    try {
      const response = await axios.post("/api/auth/verify-email", { email })
      setStatus("success")
      setMessage(response.data.message)
    } catch (error) {
      setStatus("error")
      setMessage(error.response?.data?.message || "Failed to resend verification email")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />}
            {status === "success" && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-500" />}
            {status === "verify" && <Mail className="h-12 w-12 text-blue-500" />}
            {status === "resend" && <Mail className="h-12 w-12 text-blue-500" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
            {status === "verify" && "Verify Email"}
            {status === "resend" && "Resend Verification"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>.

        <CardContent>
          {status === "success" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Your email has been successfully verified. You will be redirected to the login page shortly.
              </p>
              <Button onClick={() => router.push("/auth/login")} className="w-full">
                Go to Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <Button onClick={() => setStatus("verify")} variant="outline" className="w-full">
                Try Again
              </Button>
              <Button onClick={() => setStatus("resend")} variant="outline" className="w-full">
                Resend Verification Email
              </Button>
            </div>
          )}

          {status === "verify" && (
            <form onSubmit={verifyEmail} className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Verify Email
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatus("resend")}
                className="w-full"
              >
                Resend Verification Email
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </form>
          )}

          {status === "resend" && (
            <form onSubmit={resendVerification} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <Button type="submit" disabled={resending} className="w-full">
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}