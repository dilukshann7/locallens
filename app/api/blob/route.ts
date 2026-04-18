import { NextRequest, NextResponse } from "next/server"
import { uploadImage } from "@/lib/blob"
import { isCurrentUserAdmin } from "@/lib/auth/session"

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"])
const maxImageSizeBytes = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const attractionId = formData.get("attractionId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are supported" },
        { status: 400 }
      )
    }

    if (file.size > maxImageSizeBytes) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller" },
        { status: 400 }
      )
    }

    if (!attractionId) {
      return NextResponse.json(
        { error: "No attractionId provided" },
        { status: 400 }
      )
    }

    const url = await uploadImage(file, attractionId)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
