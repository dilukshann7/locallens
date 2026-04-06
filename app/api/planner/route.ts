import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/session"
import {
  clearPlannerForUser,
  getPlannerForUser,
  savePlannerForUser,
} from "@/lib/planner"
import {
  createEmptyPlannerState,
  toPlannerStop,
  type PlannerState,
  type TransportMode,
} from "@/lib/planner-types"

function isTransportMode(value: unknown): value is TransportMode {
  return (
    value === "walk" ||
    value === "tuk-tuk" ||
    value === "car" ||
    value === "bus" ||
    value === "train" ||
    value === "bike"
  )
}

function getPlannerPayload(body: unknown): PlannerState | null {
  if (typeof body !== "object" || body === null || !("items" in body)) {
    return null
  }

  const fallback = createEmptyPlannerState()
  const items = Array.isArray(body.items)
    ? body.items
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null
        )
        .filter(
          (item) =>
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.description === "string"
        )
        .map((item) =>
          toPlannerStop(
            {
              id: item.id as string,
              name: item.name as string,
              description: item.description as string,
              shortDescription:
                typeof item.shortDescription === "string"
                  ? item.shortDescription
                  : undefined,
              categoryId:
                typeof item.categoryId === "string"
                  ? item.categoryId
                  : undefined,
              latitude:
                typeof item.latitude === "string" ? item.latitude : undefined,
              longitude:
                typeof item.longitude === "string" ? item.longitude : undefined,
              address:
                typeof item.address === "string" ? item.address : undefined,
              distanceFromBeragalaKm:
                typeof item.distanceFromBeragalaKm === "string"
                  ? item.distanceFromBeragalaKm
                  : undefined,
              images: Array.isArray(item.images)
                ? item.images.filter(
                    (value): value is string => typeof value === "string"
                  )
                : undefined,
              suggestedVisitDurationMinutes:
                typeof item.suggestedVisitDurationMinutes === "number"
                  ? item.suggestedVisitDurationMinutes
                  : undefined,
              bestTimeToVisit:
                typeof item.bestTimeToVisit === "string"
                  ? item.bestTimeToVisit
                  : undefined,
              weatherNote:
                typeof item.weatherNote === "string"
                  ? item.weatherNote
                  : undefined,
              safetyNote:
                typeof item.safetyNote === "string"
                  ? item.safetyNote
                  : undefined,
              isPopular: Boolean(item.isPopular),
              isActive: item.isActive !== false,
              category: undefined,
            },
            {
              visitDurationMinutes:
                typeof item.visitDurationMinutes === "number"
                  ? item.visitDurationMinutes
                  : undefined,
              travelMinutes:
                typeof item.travelMinutes === "number"
                  ? item.travelMinutes
                  : undefined,
              transportMode: isTransportMode(item.transportMode)
                ? item.transportMode
                : undefined,
              notes: typeof item.notes === "string" ? item.notes : undefined,
            }
          )
        )
    : null

  if (!items) {
    return null
  }

  return {
    tripName:
      "tripName" in body &&
      typeof body.tripName === "string" &&
      body.tripName.trim()
        ? body.tripName
        : fallback.tripName,
    tripDate:
      "tripDate" in body && typeof body.tripDate === "string"
        ? body.tripDate
        : "",
    dayStartTime:
      "dayStartTime" in body && typeof body.dayStartTime === "string"
        ? body.dayStartTime
        : fallback.dayStartTime,
    startLocation:
      "startLocation" in body && typeof body.startLocation === "string"
        ? body.startLocation
        : fallback.startLocation,
    endLocation:
      "endLocation" in body && typeof body.endLocation === "string"
        ? body.endLocation
        : fallback.endLocation,
    items,
  }
}

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const planner = await getPlannerForUser(session.user.id)

    return NextResponse.json({ planner })
  } catch (error) {
    console.error("Planner fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch planner" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const planner = getPlannerPayload(body)

    if (!planner) {
      return NextResponse.json(
        { error: "Invalid planner payload" },
        { status: 400 }
      )
    }

    const savedPlanner = await savePlannerForUser(session.user.id, planner)

    return NextResponse.json({ planner: savedPlanner })
  } catch (error) {
    console.error("Planner save error:", error)
    return NextResponse.json(
      { error: "Failed to save planner" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clearPlannerForUser(session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Planner clear error:", error)
    return NextResponse.json(
      { error: "Failed to clear planner" },
      { status: 500 }
    )
  }
}
