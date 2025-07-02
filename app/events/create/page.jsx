"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Upload, Video } from "lucide-react";
import Navbar from "@/components/global/Navbar";
import GoogleMapsInput from "@/components/ui/GoogleMapsInput";

const validationSchema = Yup.object({
  eventName: Yup.string().required("Event name is required"),
  category: Yup.string().required("Category is required"),
  eventDate: Yup.date().required("Event date is required"),
  eventTime: Yup.string().required("Event time is required"),
  duration: Yup.string().required("Duration is required"),
  eventLocation: Yup.string().required("Event location is required"),
  ticketPrice: Yup.number()
    .min(0, "Price must be positive")
    .required("Ticket price is required"),
  capacity: Yup.number()
    .min(1, "Capacity must be at least 1")
    .required("Capacity is required"),
  eventDescription: Yup.string().required("Event description is required"),
  ageRestrictions: Yup.string().required("Age restrictions are required"),
});

const categories = [
  "Music",
  "Sports",
  "Technology",
  "Business",
  "Arts",
  "Food",
  "Health",
  "Education",
  "Entertainment",
  "Culture",
  "Religious",
  "Recreational",
  "Concert",
  "Workshop",
  "Party",
  "Other",
];

export default function CreateEventForm() {
  const [eventVideo, setEventVideo] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [locationData, setLocationData] = useState(null);

  const formik = useFormik({
    initialValues: {
      eventName: "",
      category: "",
      eventDate: "",
      eventTime: "",
      duration: "",
      eventLocation: "",
      ticketPrice: "",
      capacity: "",
      eventDescription: "",
      additionalInfo: "",
      ageRestrictions: "",
      genderRestrictions: "all",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!eventVideo || !videoThumbnail) {
        alert("Please upload both event video and thumbnail");
        return;
      }

      try {
        setUploading(true);

        // Upload video
        const videoFormData = new FormData();
        videoFormData.append("file", eventVideo);
        videoFormData.append("type", "video");

        const videoUploadResponse = await axios.post(
          `/api/upload`,
          videoFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Upload thumbnail
        const thumbnailFormData = new FormData();
        thumbnailFormData.append("file", videoThumbnail);
        thumbnailFormData.append("type", "image");

        const thumbnailUploadResponse = await axios.post(
          `/api/upload`,
          thumbnailFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Create event
        await axios
          .post("/api/events", {
            ...values,
            eventLocation: locationData || { address: values.eventLocation },
            eventVideo: videoUploadResponse.data.url,
            videoThumbnail: thumbnailUploadResponse.data.url,
            creator: session.user.id,
          })
          .then((res) => {
            console.log("Event created successfully:", res.data);

            setUploading(false);
            router.push("/");
          });
      } catch (error) {
        setUploading(false);
        console.error("Event creation error:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventVideo(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoThumbnail(file);
    }
  };

  const handleLocationChange = (address, data) => {
    console.log("Selected address:", address);
    console.log("Location data:", data);

    formik.setFieldValue("eventLocation", address);
    setLocationData(data);
  };

  return (
    <div>
      {/* <Navbar /> */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Create New Event
            </CardTitle>
            <CardDescription>
              Fill in the details to create your event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    name="eventName"
                    value={formik.values.eventName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.eventName && formik.errors.eventName
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.eventName && formik.errors.eventName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.eventName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) =>
                      formik.setFieldValue("category", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        formik.touched.category && formik.errors.category
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category.toLowerCase()}
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    value={formik.values.eventDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.eventDate && formik.errors.eventDate
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.eventDate && formik.errors.eventDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.eventDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eventTime">Event Time</Label>
                  <Input
                    id="eventTime"
                    name="eventTime"
                    type="time"
                    value={formik.values.eventTime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.eventTime && formik.errors.eventTime
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.eventTime && formik.errors.eventTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.eventTime}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    placeholder="e.g., 2 hours"
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.duration && formik.errors.duration
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.duration && formik.errors.duration && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.duration}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="eventLocation">Event Location</Label>
                <GoogleMapsInput
                  value={formik.values.eventLocation}
                  onChange={handleLocationChange}
                  placeholder="Search for event location..."
                />
                {formik.touched.eventLocation &&
                  formik.errors.eventLocation && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.eventLocation}
                    </p>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticketPrice">Ticket Price (R)</Label>
                  <Input
                    id="ticketPrice"
                    name="ticketPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formik.values.ticketPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.ticketPrice && formik.errors.ticketPrice
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.ticketPrice && formik.errors.ticketPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.ticketPrice}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={formik.values.capacity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.capacity && formik.errors.capacity
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.capacity && formik.errors.capacity && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.capacity}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="eventDescription">Event Description</Label>
                <Textarea
                  id="eventDescription"
                  name="eventDescription"
                  rows={4}
                  value={formik.values.eventDescription}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.eventDescription &&
                    formik.errors.eventDescription
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.eventDescription &&
                  formik.errors.eventDescription && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.eventDescription}
                    </p>
                  )}
              </div>

              <div>
                <Label htmlFor="additionalInfo">
                  Additional Information (Optional)
                </Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={3}
                  value={formik.values.additionalInfo}
                  onChange={formik.handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ageRestrictions">Age Restrictions</Label>
                  <Select
                    onValueChange={(value) =>
                      formik.setFieldValue("ageRestrictions", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        formik.touched.ageRestrictions &&
                        formik.errors.ageRestrictions
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select age restriction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-restriction">
                        No Restriction
                      </SelectItem>
                      <SelectItem value="<18">Under 18</SelectItem>
                      <SelectItem value="18-29">18 - 29</SelectItem>
                      <SelectItem value="30-39">30 - 39</SelectItem>
                      <SelectItem value="40<">40 and above</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.ageRestrictions &&
                    formik.errors.ageRestrictions && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.ageRestrictions}
                      </p>
                    )}
                </div>

                <div>
                  <Label htmlFor="genderRestrictions">
                    Gender Restrictions
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      formik.setFieldValue("genderRestrictions", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender restriction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">No Restriction</SelectItem>
                      <SelectItem value="male">Male Only</SelectItem>
                      <SelectItem value="female">Female Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Event Video</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {eventVideo ? (
                        <Video className="h-12 w-12 text-green-500" />
                      ) : (
                        <Video className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Upload className="h-4 w-4 mr-2" />
                        {eventVideo ? "Change Video" : "Upload Video"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={handleVideoChange}
                      />
                    </label>
                    {eventVideo && (
                      <span className="text-sm text-gray-600">
                        {eventVideo.name}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Video Thumbnail</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {videoThumbnail ? (
                        <img
                          className="h-12 w-12 rounded object-cover"
                          src={
                            URL.createObjectURL(videoThumbnail) ||
                            "/placeholder.svg"
                          }
                          alt="Thumbnail preview"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Upload className="h-4 w-4 mr-2" />
                        {videoThumbnail
                          ? "Change Thumbnail"
                          : "Upload Thumbnail"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={formik.isSubmitting || uploading}
              >
                {formik.isSubmitting || uploading
                  ? "Creating Event..."
                  : "Create Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
