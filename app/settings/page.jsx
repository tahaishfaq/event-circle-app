"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, User, Lock, Save } from "lucide-react";
import Navbar from "@/components/global/Navbar";
import { Progress } from "@/components/ui/progress";

const profileValidationSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  username: Yup.string().required("Username is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  gender: Yup.string().required("Gender is required"),
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${session?.user?.username}`);
      console.log("User profile data:", response.data);
      setUserProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    }
  };

  const profileFormik = useFormik({
    initialValues: {
      fullName: userProfile?.fullName || "",
      username: userProfile?.username || "",
      phoneNumber: userProfile?.phoneNumber || "",
      dateOfBirth: userProfile?.dateOfBirth
        ? new Date(userProfile.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: userProfile?.gender || "",
    },
    enableReinitialize: true,
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        setUploading(true);

        let profilePictureUrl = userProfile?.profilePicture;

        if (profilePicture) {
          const formData = new FormData();
          formData.append("file", profilePicture);
          formData.append("type", "image");

          const uploadResponse = await axios.post(`/api/upload`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          });
          profilePictureUrl = uploadResponse.data.url;
        }

        const response = await axios.put("/api/users/profile", {
          ...values,
          profilePicture: profilePictureUrl,
        });

        setUploading(false);
        setUploadProgress(0);
        fetchUserProfile();
      } catch (error) {
        console.error("Profile update error:", error);
        setUploading(false);
        setUploadProgress(0);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        await axios.put("/api/users/password", {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        passwordFormik.resetForm();
      } catch (error) {
        console.error("Password update error:", error);
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={profileFormik.handleSubmit}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={
                            profilePicture
                              ? URL.createObjectURL(profilePicture)
                              : userProfile?.profilePicture ||
                                "/placeholder.svg"
                          }
                        />
                        <AvatarFallback className="text-2xl">
                          {userProfile?.fullName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Upload className="h-4 w-4 mr-2" />
                          Change Photo
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, GIF or PNG. Max size of 5MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={profileFormik.values.fullName}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={
                          profileFormik.touched.fullName &&
                          profileFormik.errors.fullName
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {profileFormik.touched.fullName &&
                        profileFormik.errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">
                            {profileFormik.errors.fullName}
                          </p>
                        )}
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={profileFormik.values.username}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={
                          profileFormik.touched.username &&
                          profileFormik.errors.username
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {profileFormik.touched.username &&
                        profileFormik.errors.username && (
                          <p className="text-red-500 text-sm mt-1">
                            {profileFormik.errors.username}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={profileFormik.values.phoneNumber}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={
                          profileFormik.touched.phoneNumber &&
                          profileFormik.errors.phoneNumber
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {profileFormik.touched.phoneNumber &&
                        profileFormik.errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {profileFormik.errors.phoneNumber}
                          </p>
                        )}
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={profileFormik.values.dateOfBirth}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={
                          profileFormik.touched.dateOfBirth &&
                          profileFormik.errors.dateOfBirth
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {profileFormik.touched.dateOfBirth &&
                        profileFormik.errors.dateOfBirth && (
                          <p className="text-red-500 text-sm mt-1">
                            {profileFormik.errors.dateOfBirth}
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileFormik.values.gender}
                      onValueChange={(value) =>
                        profileFormik.setFieldValue("gender", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          profileFormik.touched.gender &&
                          profileFormik.errors.gender
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
                    {profileFormik.touched.gender &&
                      profileFormik.errors.gender && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileFormik.errors.gender}
                        </p>
                      )}
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading profile picture...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={profileFormik.isSubmitting || uploading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {profileFormik.isSubmitting || uploading
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={passwordFormik.handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={
                        passwordFormik.touched.currentPassword &&
                        passwordFormik.errors.currentPassword
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {passwordFormik.touched.currentPassword &&
                      passwordFormik.errors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordFormik.errors.currentPassword}
                        </p>
                      )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={
                        passwordFormik.touched.newPassword &&
                        passwordFormik.errors.newPassword
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {passwordFormik.touched.newPassword &&
                      passwordFormik.errors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordFormik.errors.newPassword}
                        </p>
                      )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={
                        passwordFormik.touched.confirmPassword &&
                        passwordFormik.errors.confirmPassword
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {passwordFormik.touched.confirmPassword &&
                      passwordFormik.errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordFormik.errors.confirmPassword}
                        </p>
                      )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={passwordFormik.isSubmitting}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {passwordFormik.isSubmitting
                      ? "Updating..."
                      : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
