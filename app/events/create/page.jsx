

// "use client";

// import { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Upload, Video } from "lucide-react";
// import Navbar from "@/components/global/Navbar";
// import GoogleMapsInput from "@/components/ui/GoogleMapsInput";

// const validationSchema = Yup.object({
//   eventName: Yup.string().required("Event name is required"),
//   category: Yup.string().required("Category is required"),
//   eventDate: Yup.date().required("Event date is required"),
//   eventTime: Yup.string().required("Event time is required"),
//   duration: Yup.string().required("Duration is required"),
//   eventLocation: Yup.string().required("Event location is required"),
//   ticketPrice: Yup.number()
//     .min(0, "Price must be positive")
//     .required("Ticket price is required"),
//   capacity: Yup.number()
//     .min(1, "Capacity must be at least 1")
//     .required("Capacity is required"),
//   eventDescription: Yup.string().required("Event description is required"),
//   ageRestrictions: Yup.array()
//     .min(1, "At least one age restriction is required")
//     .required("Age restrictions are required"),
//   genderRestrictions: Yup.string().required("Gender restriction is required"),
// });

// const categories = [
//   "Music",
//   "Sports",
//   "Technology",
//   "Business",
//   "Arts",
//   "Food",
//   "Health",
//   "Education",
//   "Entertainment",
//   "Culture",
//   "Religious",
//   "Recreational",
//   "Concert",
//   "Workshop",
//   "Party",
//   "Other",
// ];

// const ageRestrictionOptions = [
//   { value: "no-restriction", label: "No Restriction" },
//   { value: "<18", label: "Under 18" },
//   { value: "18-29", label: "18 - 29" },
//   { value: "30-39", label: "30 - 39" },
//   { value: "40<", label: "40 and above" },
// ];

// export default function CreateEventForm() {
//   const [eventVideo, setEventVideo] = useState(null);
//   const [videoThumbnail, setVideoThumbnail] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [locationData, setLocationData] = useState(null);

//   const formik = useFormik({
//     initialValues: {
//       eventName: "",
//       category: "",
//       eventDate: "",
//       eventTime: "",
//       duration: "",
//       eventLocation: "",
//       ticketPrice: "",
//       capacity: "",
//       eventDescription: "",
//       additionalInfo: "",
//       ageRestrictions: [],
//       genderRestrictions: "all",
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       if (!eventVideo || !videoThumbnail) {
//         alert("Please upload both event video and thumbnail");
//         return;
//       }

//       try {
//         setUploading(true);

//         // Upload video
//         const videoFormData = new FormData();
//         videoFormData.append("file", eventVideo);
//         videoFormData.append("type", "video");

//         const videoUploadResponse = await axios.post(
//           `/api/upload`,
//           videoFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         // Upload thumbnail
//         const thumbnailFormData = new FormData();
//         thumbnailFormData.append("file", videoThumbnail);
//         thumbnailFormData.append("type", "image");

//         const thumbnailUploadResponse = await axios.post(
//           `/api/upload`,
//           thumbnailFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         // Create event
//         await axios
//           .post("/api/events", {
//             ...values,
//             eventLocation: locationData || { address: values.eventLocation },
//             eventVideo: videoUploadResponse.data.url,
//             videoThumbnail: thumbnailUploadResponse.data.url,
//             creator: session.user.id,
//           })
//           .then((res) => {
//             console.log("Event created successfully:", res.data);
//             setUploading(false);
//             router.push("/");
//           });
//       } catch (error) {
//         setUploading(false);
//         console.error("Event creation error:", error);
//       } finally {
//         setUploading(false);
//       }
//     },
//   });

//   const handleVideoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setEventVideo(file);
//     }
//   };

//   const handleThumbnailChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setVideoThumbnail(file);
//     }
//   };

//   const handleLocationChange = (address, data) => {
//     console.log("Selected address:", address);
//     console.log("Location data:", data);
//     formik.setFieldValue("eventLocation", address);
//     setLocationData(data);
//   };

//   const handleAgeRestrictionChange = (value) => {
//     const currentRestrictions = formik.values.ageRestrictions;
//     if (currentRestrictions.includes(value)) {
//       formik.setFieldValue(
//         "ageRestrictions",
//         currentRestrictions.filter((r) => r !== value)
//       );
//     } else {
//       formik.setFieldValue("ageRestrictions", [...currentRestrictions, value]);
//     }
//   };

//   return (
//     <div>
//       {/* <Navbar /> */}
//       <div className="max-w-2xl mx-auto py-8 px-4">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold">
//               Create New Event
//             </CardTitle>
//             <CardDescription>
//               Fill in the details to create your event
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={formik.handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="eventName">Event Name</Label>
//                   <Input
//                     id="eventName"
//                     name="eventName"
//                     value={formik.values.eventName}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={
//                       formik.touched.eventName && formik.errors.eventName
//                         ? "border-red-500"
//                         : ""
//                     }
//                   />
//                   {formik.touched.eventName && formik.errors.eventName && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.eventName}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <Label htmlFor="category">Category</Label>
//                   <Select
//                     onValueChange={(value) =>
//                       formik.setFieldValue("category", value)
//                     }
//                   >
//                     <SelectTrigger
//                       className={
//                         formik.touched.category && formik.errors.category
//                           ? "border-red-500"
//                           : ""
//                       }
//                     >
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {categories.map((category) => (
//                         <SelectItem
//                           key={category}
//                           value={category.toLowerCase()}
//                         >
//                           {category}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {formik.touched.category && formik.errors.category && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.category}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label htmlFor="eventDate">Event Date</Label>
//                   <Input
//                     id="eventDate"
//                     name="eventDate"
//                     type="date"
//                     value={formik.values.eventDate}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={
//                       formik.touched.eventDate && formik.errors.eventDate
//                         ? "border-red-500"
//                         : ""
//                     }
//                   />
//                   {formik.touched.eventDate && formik.errors.eventDate && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.eventDate}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <Label htmlFor="eventTime">Event Time</Label>
//                   <Input
//                     id="eventTime"
//                     name="eventTime"
//                     type="time"
//                     value={formik.values.eventTime}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={
//                       formik.touched.eventTime && formik.errors.eventTime
//                         ? "border-red-500"
//                         : ""
//                     }
//                   />
//                   {formik.touched.eventTime && formik.errors.eventTime && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.eventTime}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <Label htmlFor="duration">Duration</Label>
//                   <Input
//                     id="duration"
//                     name="duration"
//                     placeholder="e.g., 2 hours"
//                     value={formik.values.duration}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={
//                       formik.touched.duration && formik.errors.duration
//                         ? "border-red-500"
//                         : ""
//                     }
//                   />
//                   {formik.touched.duration && formik.errors.duration && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.duration}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="eventLocation">Event Location</Label>
//                 <GoogleMapsInput
//                   value={formik.values.eventLocation}
//                   onChange={handleLocationChange}
//                   placeholder="Search for event location..."
//                 />
//                 {formik.touched.eventLocation &&
//                   formik.errors.eventLocation && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.eventLocation}
//                     </p>
//                   )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="ticketPrice">Ticket Price (R)</Label>
//                   <Input
//                     id="ticketPrice"
//                     name="ticketPrice"
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={formik.values.ticketPrice}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={
//                       formik.touched.ticketPrice && formik.errors.ticketPrice
//                         ? "border-red-500"
//                         : ""
//                     }
//                   />
//                   {formik.touched.ticketPrice && formik.errors.ticketPrice && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.ticketPrice}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <Label htmlFor="capacity">Capacity</Label>
//                   <Input
//                     id="capacity"
//                     name="capacity"
//                     type="number"
//                     min="1"
//                     value={formik.values.capacity}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className={
//                       formik.touched.capacity && formik.errors.capacity
//                         ? "border-red-500"
//                         : ""
//                     }
//                   />
//                   {formik.touched.capacity && formik.errors.capacity && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.capacity}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="eventDescription">Event Description</Label>
//                 <Textarea
//                   id="eventDescription"
//                   name="eventDescription"
//                   rows={4}
//                   value={formik.values.eventDescription}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   className={
//                     formik.touched.eventDescription &&
//                     formik.errors.eventDescription
//                       ? "border-red-500"
//                       : ""
//                   }
//                 />
//                 {formik.touched.eventDescription &&
//                   formik.errors.eventDescription && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {formik.errors.eventDescription}
//                     </p>
//                   )}
//               </div>

//               <div>
//                 <Label htmlFor="additionalInfo">
//                   Additional Information (Optional)
//                 </Label>
//                 <Textarea
//                   id="additionalInfo"
//                   name="additionalInfo"
//                   rows={3}
//                   value={formik.values.additionalInfo}
//                   onChange={formik.handleChange}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label>Age Restrictions</Label>
//                   <div className="space-y-2 mt-2">
//                     {ageRestrictionOptions.map((option) => (
//                       <div key={option.value} className="flex items-center space-x-2">
//                         <Checkbox
//                           id={option.value}
//                           checked={formik.values.ageRestrictions.includes(option.value)}
//                           onCheckedChange={() => handleAgeRestrictionChange(option.value)}
//                         />
//                         <Label htmlFor={option.value}>{option.label}</Label>
//                       </div>
//                     ))}
//                   </div>
//                   {formik.touched.ageRestrictions &&
//                     formik.errors.ageRestrictions && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {formik.errors.ageRestrictions}
//                       </p>
//                     )}
//                 </div>

//                 <div>
//                   <Label>Gender Restrictions</Label>
//                   <RadioGroup
//                     onValueChange={(value) =>
//                       formik.setFieldValue("genderRestrictions", value)
//                     }
//                     value={formik.values.genderRestrictions}
//                     className="space-y-2 mt-2"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="all" id="gender-all" />
//                       <Label htmlFor="gender-all">No Restriction</Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="male" id="gender-male" />
//                       <Label htmlFor="gender-male">Male</Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="female" id="gender-female" />
//                       <Label htmlFor="gender-female">Female</Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="other" id="other" />
//                       <Label htmlFor="other">Other</Label>
//                     </div>
//                   </RadioGroup>
//                   {formik.touched.genderRestrictions &&
//                     formik.errors.genderRestrictions && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {formik.errors.genderRestrictions}
//                       </p>
//                     )}
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <Label>Event Video</Label>
//                   <div className="mt-1 flex items-center space-x-4">
//                     <div className="flex-shrink-0">
//                       {eventVideo ? (
//                         <Video className="h-12 w-12 text-green-500" />
//                       ) : (
//                         <Video className="h-12 w-12 text-gray-400" />
//                       )}
//                     </div>
//                     <label className="cursor-pointer">
//                       <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
//                         <Upload className="h-4 w-4 mr-2" />
//                         {eventVideo ? "Change Video" : "Upload Video"}
//                       </span>
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept="video/*"
//                         onChange={handleVideoChange}
//                       />
//                     </label>
//                     {eventVideo && (
//                       <span className="text-sm text-gray-600">
//                         {eventVideo.name}
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <Label>Video Thumbnail</Label>
//                   <div className="mt-1 flex items-center space-x-4">
//                     <div className="flex-shrink-0">
//                       {videoThumbnail ? (
//                         <img
//                           className="h-12 w-12 rounded object-cover"
//                           src={
//                             URL.createObjectURL(videoThumbnail) ||
//                             "/placeholder.svg"
//                           }
//                           alt="Thumbnail preview"
//                         />
//                       ) : (
//                         <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
//                           <Upload className="h-6 w-6 text-gray-400" />
//                         </div>
//                       )}
//                     </div>
//                     <label className="cursor-pointer">
//                       <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
//                         <Upload className="h-4 w-4 mr-2" />
//                         {videoThumbnail
//                           ? "Change Thumbnail"
//                           : "Upload Thumbnail"}
//                       </span>
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept="image/*"
//                         onChange={handleThumbnailChange}
//                       />
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={formik.isSubmitting || uploading}
//               >
//                 {formik.isSubmitting || uploading
//                   ? "Creating Event..."
//                   : "Create Event"}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useRef } from "react";
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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Video, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
  ageRestrictions: Yup.array()
    .min(1, "At least one age restriction is required")
    .required("Age restrictions are required"),
  genderRestrictions: Yup.string().required("Gender restriction is required"),
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

const ageRestrictionOptions = [
  { value: "no-restriction", label: "No Restriction" },
  { value: "<18", label: "Under 18" },
  { value: "18-29", label: "18 - 29" },
  { value: "30-39", label: "30 - 39" },
  { value: "40<", label: "40 and above" },
];

export default function CreateEventForm() {
  const [eventVideo, setEventVideo] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [videoError, setVideoError] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [locationData, setLocationData] = useState(null);
  const videoInputRef = useRef(null);

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
      ageRestrictions: [],
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
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );

        // Upload thumbnail
        const thumbnailFormData = new FormData();
        thumbnailFormData.append("file", videoThumbnail);
        thumbnailFormData.append("type", "image");

        setThumbnailUploading(true);
        const thumbnailUploadResponse = await axios.post(
          `/api/upload`,
          thumbnailFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setThumbnailProgress(percentCompleted);
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
            setUploadProgress(0);
            setThumbnailUploading(false);
            setThumbnailProgress(0);
            router.push("/");
          });
      } catch (error) {
        setUploading(false);
        setUploadProgress(0);
        setThumbnailUploading(false);
        setThumbnailProgress(0);
        console.error("Event creation error:", error);
      }
    },
  });

  const checkVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          reject("Video duration must not exceed 1 minute");
        } else {
          resolve();
        }
      };
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject("Error loading video");
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await checkVideoDuration(file);
        setEventVideo(file);
        setVideoError(null);
      } catch (error) {
        setVideoError(error);
        setEventVideo(null);
        videoInputRef.current.value = null;
        alert(error);
      }
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

  const handleAgeRestrictionChange = (value) => {
    const currentRestrictions = formik.values.ageRestrictions;
    if (currentRestrictions.includes(value)) {
      formik.setFieldValue(
        "ageRestrictions",
        currentRestrictions.filter((r) => r !== value)
      );
    } else {
      formik.setFieldValue("ageRestrictions", [...currentRestrictions, value]);
    }
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
                  <Label>Age Restrictions</Label>
                  <div className="space-y-2 mt-2">
                    {ageRestrictionOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={formik.values.ageRestrictions.includes(option.value)}
                          onCheckedChange={() => handleAgeRestrictionChange(option.value)}
                        />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                  {formik.touched.ageRestrictions &&
                    formik.errors.ageRestrictions && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.ageRestrictions}
                      </p>
                    )}
                </div>

                <div>
                  <Label>Gender Restrictions</Label>
                  <RadioGroup
                    onValueChange={(value) =>
                      formik.setFieldValue("genderRestrictions", value)
                    }
                    value={formik.values.genderRestrictions}
                    className="space-y-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="gender-all" />
                      <Label htmlFor="gender-all">No Restriction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="gender-male" />
                      <Label htmlFor="gender-male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="gender-female" />
                      <Label htmlFor="gender-female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                  {formik.touched.genderRestrictions &&
                    formik.errors.genderRestrictions && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.genderRestrictions}
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Event Video (Max 1 minute)</Label>
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
                        ref={videoInputRef}
                        onChange={handleVideoChange}
                      />
                    </label>
                    {eventVideo && (
                      <span className="text-sm text-gray-600">
                        {eventVideo.name}
                      </span>
                    )}
                  </div>
                  {uploading && (
                    <div className="mt-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-600 mt-1">
                        Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}
                  {videoError && (
                    <p className="text-red-500 text-sm mt-1">{videoError}</p>
                  )}
                </div>

                <div>
                  <Label>Video Thumbnail</Label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0 relative">
                      {videoThumbnail ? (
                        <div className="relative">
                          <img
                            className="h-12 w-12 rounded object-cover"
                            src={
                              URL.createObjectURL(videoThumbnail) ||
                              "/placeholder.svg"
                            }
                            alt="Thumbnail preview"
                          />
                          {thumbnailUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
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
                disabled={formik.isSubmitting || uploading || thumbnailUploading}
              >
                {formik.isSubmitting || uploading || thumbnailUploading
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