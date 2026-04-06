import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { attraction } from "@/lib/db/schema"
import { isCurrentUserAdmin } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const id =
      body.id || `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    await db.insert(attraction).values({
      id,
      name: body.name,
      description: body.description,
      shortDescription: body.shortDescription,
      categoryId: body.categoryId,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address,
      distanceFromBeragalaKm: body.distanceFromBeragalaKm,
      images: body.images,
      suggestedVisitDurationMinutes: body.suggestedVisitDurationMinutes,
      bestTimeToVisit: body.bestTimeToVisit,
      weatherNote: body.weatherNote,
      safetyNote: body.safetyNote,
      isPopular: body.isPopular || false,
      isActive: true,
    })

    return NextResponse.json({ id, success: true })
  } catch (error) {
    console.error("Create error:", error)
    return NextResponse.json(
      { error: "Failed to create attraction" },
      { status: 500 }
    )
  }
}
