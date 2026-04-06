import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { attraction } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { deleteAttractionImages } from "@/lib/blob"
import { isCurrentUserAdmin } from "@/lib/auth/session"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updates: Record<string, unknown> = {
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
      isPopular: body.isPopular,
    }

    await db.update(attraction).set(updates).where(eq(attraction.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json(
      { error: "Failed to update attraction" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
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
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete attraction" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await db
      .select()
      .from(attraction)
      .where(eq(attraction.id, id))
      .then((rows) => rows[0])

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get error:", error)
    return NextResponse.json(
      { error: "Failed to get attraction" },
      { status: 500 }
    )
  }
}
