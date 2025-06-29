"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, User } from "lucide-react";

const validationSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  gender: Yup.string().required("Gender is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
});

export default function RegisterForm() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      dateOfBirth: "",
      gender: "",
      phoneNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        let profilePictureUrl = "";

        if (profilePicture) {
          console.log("Uploading profile picture...", profilePicture);
          setUploading(true);
          const formData = new FormData();
          formData.append("file", profilePicture);
          formData.append("type", "image");

          const response = await axios.post("/api/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          console.log("Upload response:", response.data);
          profilePictureUrl = response.data.url;
          setUploading(false);
        }

        await axios.post("/api/auth/register", {
          ...values,
          profilePicture: profilePictureUrl,
        });

        router.push("/auth/login?message=Registration successful");
      } catch (error) {
        console.error("Registration error:", error);
        alert(error.response?.data?.message || "Registration failed");
      }finally{
        setUploading(false);
        formik.isSubmitting = false;
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join Event Circle to discover and create amazing events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.fullName && formik.errors.fullName
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.fullName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.username && formik.errors.username
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.username}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.dateOfBirth && formik.errors.dateOfBirth
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.dateOfBirth}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                onValueChange={(value) => formik.setFieldValue("gender", value)}
              >
                <SelectTrigger
                  className={
                    formik.touched.gender && formik.errors.gender
                      ? "border-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.gender}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.phoneNumber && formik.errors.phoneNumber
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {profilePicture ? (
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={
                        URL.createObjectURL(profilePicture) ||
                        "/placeholder.svg"
                      }
                      alt="Profile preview"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={formik.isSubmitting || uploading}
            >
              {formik.isSubmitting || uploading
                ? "Creating Account..."
                : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
