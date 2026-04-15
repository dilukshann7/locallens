import { NextRequest, NextResponse } from "next/server"
import { uploadImage } from "@/lib/blob"
import { isCurrentUserAdmin } from "@/lib/auth/session"

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
