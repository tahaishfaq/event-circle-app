import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file) {
  try {
    const result = await cloudinary.uploader.upload(file, {
        folder: "eventcircle",
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });
      
    return result.secure_url
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error)
    throw new Error("Failed to upload image")
  }
}

export async function uploadDocument(file) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "eventcircle/documents",
      resource_type: "auto",
    })
    return result.secure_url
  } catch (error) {
    console.error("Error uploading document to Cloudinary:", error)
    throw new Error("Failed to upload document")
  }
}

export async function uploadVideo(file) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "eventcircle/videos",
      resource_type: "video",
      transformation: [
        { quality: "auto:low" },          // Compress video quality
        { width: 720, crop: "limit" },    // Limit resolution (adjustable)
        { fetch_format: "auto" },         // Convert to optimal format like MP4
      ],
    })
    return result.secure_url
  } catch (error) {
    console.error("Error uploading video to Cloudinary:", error)
    throw new Error("Failed to upload video")
  }
}

export async function uploadMultipleImages(files) {
  try {
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file, {
        folder: "eventcircle",
        transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
      }),
    )
    const results = await Promise.all(uploadPromises)
    return results.map((res) => res.secure_url)
  } catch (error) {
    console.error("Error uploading multiple images to Cloudinary:", error)
    throw new Error("Failed to upload multiple images")
  }
}

export default cloudinary
