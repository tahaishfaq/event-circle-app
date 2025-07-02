"use client"

import { useState } from "react"
import Link from "next/link"
import axios from "axios"
import { Mail, ArrowLeft, Send } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSendOTP = async (values) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post("/api/auth/forget-password", {
        email: values.email,
      })
      setEmail(values.email)
      setStep(2)
      toast({
        title: "OTP Sent!",
        description: "Check your email for the 6-digit verification code.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send OTP.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post("/api/auth/verify-otp", {
        email,
        otp,
      })
      setStep(3)
      toast({
        title: "OTP Verified!",
        description: "You can now reset your password.",
      })
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: error.response?.data?.message || "Incorrect or expired OTP.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOTP = async () => {
    setIsSubmitting(true)
    try {
      await axios.post("/api/auth/forgot-password", { email })
      toast({
        title: "OTP Resent!",
        description: "A new code has been sent to your email.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (values) => {
    setIsSubmitting(true)
    try {
      await axios.post("/api/auth/reset-password", {
        email,
        otp,
        password: values.password,
      })
      setIsSuccess(true)
      toast({
        title: "Password Reset Successful!",
        description: "You can now log in with your new password.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
    }),
    onSubmit: handleSendOTP,
  })

  const passwordForm = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      password: Yup.string().min(6, "At least 6 characters").required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: handleResetPassword,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isSuccess
                ? "Password Reset Complete!"
                : step === 1
                ? "Forgot Password?"
                : step === 2
                ? "Enter Verification Code"
                : "Set New Password"}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isSuccess
                ? "Your password has been successfully updated."
                : step === 1
                ? "Enter your email address to receive a verification code."
                : step === 2
                ? `We've sent a 6-digit code to ${email}`
                : "Create a new secure password for your account."}
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            {isSuccess ? (
              <div className="text-center flex flex-col gap-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    Your password has been successfully updated. You can now log in with your new password.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : step === 1 ? (
              <form onSubmit={emailForm.handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    onChange={emailForm.handleChange}
                    onBlur={emailForm.handleBlur}
                    value={emailForm.values.email}
                    placeholder="Enter your email address"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  {emailForm.touched.email && emailForm.errors.email && (
                    <p className="text-sm text-red-500 mt-1">{emailForm.errors.email}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? "Sending..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>
            ) : step === 2 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Enter the 6-digit code sent to your email
                  </label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={isSubmitting || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? "Verifying..." : "Verify Code"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={isSubmitting}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={passwordForm.handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    value={passwordForm.values.password}
                    placeholder="Enter new password"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  {passwordForm.touched.password && passwordForm.errors.password && (
                    <p className="text-sm text-red-500 mt-1">{passwordForm.errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    value={passwordForm.values.confirmPassword}
                    placeholder="Confirm new password"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  {passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordForm.errors.confirmPassword}</p>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>At least 6 characters long</li>
                    <li>Both passwords must match</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
