import { NextRequest, NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { attraction, attractionImage } from "@/lib/db/schema"
import { deleteAttractionImages } from "@/lib/blob"
import { isCurrentUserAdmin } from "@/lib/auth/session"
import { validateAttractionPayload } from "@/lib/attraction-validation"

async function replaceAttractionImages(attractionId: string, urls: string[]) {
  await db
    .delete(attractionImage)
    .where(eq(attractionImage.attractionId, attractionId))

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const validation = validateAttractionPayload(await request.json())

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const body = validation.data

    await db
      .update(attraction)
      .set({
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
      })
      .where(eq(attraction.id, id))

    await replaceAttractionImages(id, body.images)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update attraction error:", error)
    return NextResponse.json(
      { error: "Failed to update attraction" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existingAttraction = await db
      .select({
        id: attraction.id,
      })
      .from(attraction)
      .where(eq(attraction.id, id))
      .then((rows) => rows[0] ?? null)

    if (!existingAttraction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await deleteAttractionImages(id)
    await db.delete(attraction).where(eq(attraction.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete attraction error:", error)
    return NextResponse.json(
      { error: "Failed to delete attraction" },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await db
      .select()
      .from(attraction)
      .where(eq(attraction.id, id))
      .then((rows) => rows[0] ?? null)

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const images = await db
      .select({
        url: attractionImage.url,
      })
      .from(attractionImage)
      .where(eq(attractionImage.attractionId, id))
      .orderBy(
        desc(attractionImage.isPrimary),
        attractionImage.position,
        attractionImage.createdAt
      )

    return NextResponse.json({
      ...result,
      images: images.map((image) => image.url),
    })
  } catch (error) {
    console.error("Get attraction error:", error)
    return NextResponse.json(
      { error: "Failed to get attraction" },
      { status: 500 }
    )
  }
}
