import { randomUUID } from "crypto"
import { and, desc, eq, inArray, sql } from "drizzle-orm"
import { getActiveAttractionsByIds } from "@/lib/attractions"
import { db } from "@/lib/db"
import { attraction, itinerary, itineraryItem } from "@/lib/db/schema"
import {
  createEmptyPlannerState,
  DEFAULT_DAY_START_TIME,
  DEFAULT_PLANNER_NAME,
  toPlannerStop,
  type PlannerSettingsPersistence,
  type PlannerState,
  type PlannerStopPersistence,
  type PlannerTripSummary,
} from "@/lib/planner-types"

const SRI_LANKA_OFFSET = "+05:30"

function parsePlannerItemNotes(
  rawNotes: string | null
): PlannerStopPersistence {
  if (!rawNotes) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawNotes) as PlannerStopPersistence
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {
      notes: rawNotes,
    }
  }
}

function serializePlannerItemNotes(item: {
  transportMode: PlannerStopPersistence["transportMode"]
  travelMinutes: number
  notes: string
}) {
  return JSON.stringify({
    transportMode: item.transportMode,
    travelMinutes: item.travelMinutes,
    notes: item.notes,
  } satisfies PlannerStopPersistence)
}

function parsePlannerSettings(
  rawNotes: string | null
): PlannerSettingsPersistence {
  if (!rawNotes) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawNotes) as PlannerSettingsPersistence
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function serializePlannerSettings(settings: PlannerSettingsPersistence) {
  return JSON.stringify(settings)
}

function combinePlannedDate(
  tripDate: string,
  dayStartTime: string
): Date | null {
  if (!tripDate) {
    return null
  }

  return new Date(
    `${tripDate}T${dayStartTime || DEFAULT_DAY_START_TIME}:00${SRI_LANKA_OFFSET}`
  )
}

function extractTripDate(plannedDate: Date | null): string {
  if (!plannedDate) {
    return ""
  }

  return plannedDate.toISOString().slice(0, 10)
}

async function getLatestPlanner(userId: string) {
  return db
    .select({
      id: itinerary.id,
      name: itinerary.name,
      plannedDate: itinerary.plannedDate,
      notes: itinerary.notes,
      createdAt: itinerary.createdAt,
      updatedAt: itinerary.updatedAt,
    })
    .from(itinerary)
    .where(eq(itinerary.userId, userId))
    .orderBy(desc(itinerary.updatedAt))
    .then((rows) => rows[0] ?? null)
}

async function getPlannerRowById(userId: string, tripId: string) {
  return db
    .select({
      id: itinerary.id,
      name: itinerary.name,
      plannedDate: itinerary.plannedDate,
      notes: itinerary.notes,
      createdAt: itinerary.createdAt,
      updatedAt: itinerary.updatedAt,
    })
    .from(itinerary)
    .where(and(eq(itinerary.userId, userId), eq(itinerary.id, tripId)))
    .then((rows) => rows[0] ?? null)
}

async function insertPlannerTrip(userId: string, plannerState: PlannerState) {
  const tripId = randomUUID()

  await db.insert(itinerary).values({
    id: tripId,
    userId,
    name: plannerState.tripName || DEFAULT_PLANNER_NAME,
    plannedDate: combinePlannedDate(
      plannerState.tripDate,
      plannerState.dayStartTime
    ),
    notes: serializePlannerSettings({
      tripDate: plannerState.tripDate,
      dayStartTime: plannerState.dayStartTime,
      startLocation: plannerState.startLocation,
      endLocation: plannerState.endLocation,
    }),
  })

  return tripId
}

async function replacePlannerItems(tripId: string, plannerState: PlannerState) {
  const uniqueIds = [...new Set(plannerState.items.map((item) => item.id))]

  const validRows =
    uniqueIds.length > 0
      ? await db
          .select({ id: attraction.id })
          .from(attraction)
          .where(
            and(
              inArray(attraction.id, uniqueIds),
              eq(attraction.isActive, true)
            )
          )
      : []

  const validIds = new Set(validRows.map((row) => row.id))
  const sanitizedItems = plannerState.items.filter((item) =>
    validIds.has(item.id)
  )

  await db.delete(itineraryItem).where(eq(itineraryItem.itineraryId, tripId))

  if (sanitizedItems.length === 0) {
    return
  }

  await db.insert(itineraryItem).values(
    sanitizedItems.map((item, index) => ({
      id: randomUUID(),
      itineraryId: tripId,
      attractionId: item.id,
      order: index + 1,
      visitDurationMinutes: item.visitDurationMinutes,
      notes: serializePlannerItemNotes({
        transportMode: item.transportMode,
        travelMinutes: item.travelMinutes,
        notes: item.notes,
      }),
    }))
  )
}

async function buildPlannerState(
  planner: {
    id: string
    name: string
    plannedDate: Date | null
    notes: string | null
  } | null
): Promise<PlannerState> {
  if (!planner) {
    return createEmptyPlannerState()
  }

  const itemRows = await db
    .select({
      attractionId: itineraryItem.attractionId,
      visitDurationMinutes: itineraryItem.visitDurationMinutes,
      notes: itineraryItem.notes,
    })
    .from(itineraryItem)
    .where(eq(itineraryItem.itineraryId, planner.id))
    .orderBy(itineraryItem.order)

  const attractions = await getActiveAttractionsByIds(
    itemRows.map((row) => row.attractionId)
  )
  const attractionMap = new Map(
    attractions.map((item) => [item.id, item] as const)
  )
  const settings = parsePlannerSettings(planner.notes)

  return {
    tripName: planner.name || DEFAULT_PLANNER_NAME,
    tripDate: settings.tripDate || extractTripDate(planner.plannedDate),
    dayStartTime: settings.dayStartTime || DEFAULT_DAY_START_TIME,
    startLocation: settings.startLocation || "",
    endLocation: settings.endLocation || "",
    items: itemRows
      .map((row) => {
        const attractionRecord = attractionMap.get(row.attractionId)

        if (!attractionRecord) {
          return null
        }

        const itemNotes = parsePlannerItemNotes(row.notes)

        return toPlannerStop(attractionRecord, {
          visitDurationMinutes:
            row.visitDurationMinutes ??
            attractionRecord.suggestedVisitDurationMinutes,
          travelMinutes: itemNotes.travelMinutes,
          transportMode: itemNotes.transportMode,
          notes: itemNotes.notes,
        })
      })
      .filter((item): item is ReturnType<typeof toPlannerStop> =>
        Boolean(item)
      ),
  }
}

export async function listTripsForUser(
  userId: string
): Promise<PlannerTripSummary[]> {
  const rows = await db
    .select({
      id: itinerary.id,
      name: itinerary.name,
      plannedDate: itinerary.plannedDate,
      notes: itinerary.notes,
      createdAt: itinerary.createdAt,
      updatedAt: itinerary.updatedAt,
      stopCount: sql<number>`count(${itineraryItem.id})`,
    })
    .from(itinerary)
    .leftJoin(itineraryItem, eq(itineraryItem.itineraryId, itinerary.id))
    .where(eq(itinerary.userId, userId))
    .groupBy(
      itinerary.id,
      itinerary.name,
      itinerary.plannedDate,
      itinerary.notes,
      itinerary.createdAt,
      itinerary.updatedAt
    )
    .orderBy(desc(itinerary.updatedAt))

  return rows.map((row) => {
    const settings = parsePlannerSettings(row.notes)

    return {
      id: row.id,
      name: row.name,
      tripDate: settings.tripDate || extractTripDate(row.plannedDate),
      stopCount: Number(row.stopCount ?? 0),
      updatedAt: row.updatedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      startLocation: settings.startLocation || "",
      endLocation: settings.endLocation || "",
    }
  })
}

export async function getTripForUser(
  userId: string,
  tripId: string
): Promise<PlannerState | null> {
  const planner = await getPlannerRowById(userId, tripId)

  if (!planner) {
    return null
  }

  return buildPlannerState(planner)
}

export async function createTripForUser(
  userId: string,
  plannerState: PlannerState
): Promise<{ tripId: string; planner: PlannerState }> {
  const tripId = await insertPlannerTrip(userId, plannerState)
  await replacePlannerItems(tripId, plannerState)

  const planner = await getTripForUser(userId, tripId)

  if (!planner) {
    throw new Error("Failed to create trip")
  }

  return { tripId, planner }
}

export async function updateTripForUser(
  userId: string,
  tripId: string,
  plannerState: PlannerState
): Promise<PlannerState | null> {
  const existingTrip = await getPlannerRowById(userId, tripId)

  if (!existingTrip) {
    return null
  }

  await db
    .update(itinerary)
    .set({
      name: plannerState.tripName || DEFAULT_PLANNER_NAME,
      plannedDate: combinePlannedDate(
        plannerState.tripDate,
        plannerState.dayStartTime
      ),
      notes: serializePlannerSettings({
        tripDate: plannerState.tripDate,
        dayStartTime: plannerState.dayStartTime,
        startLocation: plannerState.startLocation,
        endLocation: plannerState.endLocation,
      }),
    })
    .where(eq(itinerary.id, tripId))

  await replacePlannerItems(tripId, plannerState)

  return getTripForUser(userId, tripId)
}

export async function getPlannerForUser(userId: string): Promise<PlannerState> {
  const planner = await getLatestPlanner(userId)
  return buildPlannerState(planner)
}

export async function savePlannerForUser(
  userId: string,
  plannerState: PlannerState
): Promise<PlannerState> {
  const existingPlanner = await getLatestPlanner(userId)

  if (!existingPlanner) {
    const { planner } = await createTripForUser(userId, plannerState)
    return planner
  }

  const updated = await updateTripForUser(
    userId,
    existingPlanner.id,
    plannerState
  )

  if (!updated) {
    throw new Error("Failed to update planner")
  }

  return updated
}

export async function clearPlannerForUser(userId: string): Promise<void> {
  const planner = await getLatestPlanner(userId)

  if (!planner) {
    return
  }

  await db
    .delete(itineraryItem)
    .where(eq(itineraryItem.itineraryId, planner.id))
}
