import { NextResponse } from "next/server"
import { uploadImage, uploadVideo, uploadDocument } from "@/lib/cloudinary"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const type = formData.get("type") || "image"

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    let uploadResult

    switch (type) {
      case "video":
        uploadResult = await uploadVideo(base64)
        break
      case "document":
        uploadResult = await uploadDocument(base64)
        break
      default:
        uploadResult = await uploadImage(base64)
    }

    return NextResponse.json({
      success: true,
      url: uploadResult,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      { status: 500 },
    )
  }
}
