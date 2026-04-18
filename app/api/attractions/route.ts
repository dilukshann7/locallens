import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { attraction, attractionImage } from "@/lib/db/schema"
import { isCurrentUserAdmin } from "@/lib/auth/session"
import { validateAttractionPayload } from "@/lib/attraction-validation"

async function insertAttractionImages(attractionId: string, urls: string[]) {
  if (urls.length === 0) {
    return
  }

  await db.insert(attractionImage).values(
    urls.map((url, index) => ({
      id: crypto.randomUUID(),
      attractionId,
      url,
      altText: null,
      isPrimary: index === 0,
      position: index,
    }))
  )
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const validation = validateAttractionPayload(await request.json())

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const body = validation.data
    const id = body.id || crypto.randomUUID()

    await db.insert(attraction).values({
      id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      shortDescription: body.shortDescription,
      categoryId: body.categoryId,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address,
      distanceFromBeragalaKm: body.distanceFromBeragalaKm,
      openingHours: body.openingHours,
      travelTips: body.travelTips,
      transportInfo: body.transportInfo,
      accessibilityInfo: body.accessibilityInfo,
      crowdLevel: body.crowdLevel,
      suggestedVisitDurationMinutes: body.suggestedVisitDurationMinutes,
      bestTimeToVisit: body.bestTimeToVisit,
      weatherNote: body.weatherNote,
      safetyNote: body.safetyNote,
      disclaimer: body.disclaimer,
      isPopular: body.isPopular,
      isActive: true,
    })

    await insertAttractionImages(id, body.images)

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    console.error("Create attraction error:", error)
    return NextResponse.json(
      { error: "Failed to create attraction" },
      { status: 500 }
    )
  }
}
