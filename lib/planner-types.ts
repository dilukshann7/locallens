import type { AttractionRecord } from "@/lib/attractions"

export const DEFAULT_PLANNER_NAME = "My Day Plan"
export const DEFAULT_DAY_START_TIME = "08:00"
export const DEFAULT_STAY_DURATION_MINUTES = 90
export const DEFAULT_TRAVEL_MINUTES = 25
export const DEFAULT_START_LOCATION = ""
export const DEFAULT_END_LOCATION = ""

export const transportModes = [
  {
    value: "walk",
    label: "Walk",
  },
  {
    value: "tuk-tuk",
    label: "Tuk Tuk",
  },
  {
    value: "car",
    label: "Car",
  },
  {
    value: "bus",
    label: "Bus",
  },
  {
    value: "train",
    label: "Train",
  },
  {
    value: "bike",
    label: "Bike",
  },
] as const

export type TransportMode = (typeof transportModes)[number]["value"]

export interface PlannerStop extends AttractionRecord {
  visitDurationMinutes: number
  travelMinutes: number
  transportMode: TransportMode
  notes: string
}

export interface PlannerState {
  tripName: string
  tripDate: string
  dayStartTime: string
  startLocation: string
  endLocation: string
  items: PlannerStop[]
}

export interface PlannerTripSummary {
  id: string
  name: string
  tripDate: string
  stopCount: number
  updatedAt: string
  createdAt: string
  startLocation: string
  endLocation: string
}

export interface PlannerStopPersistence {
  transportMode?: TransportMode
  travelMinutes?: number
  notes?: string
}

export interface PlannerSettingsPersistence {
  tripDate?: string
  dayStartTime?: string
  startLocation?: string
  endLocation?: string
}

export function getDefaultVisitDurationMinutes(
  attraction: AttractionRecord
): number {
  return (
    attraction.suggestedVisitDurationMinutes ?? DEFAULT_STAY_DURATION_MINUTES
  )
}

export function toPlannerStop(
  attraction: AttractionRecord,
  overrides: Partial<PlannerStop> = {}
): PlannerStop {
  return {
    ...attraction,
    visitDurationMinutes:
      overrides.visitDurationMinutes ??
      getDefaultVisitDurationMinutes(attraction),
    travelMinutes: overrides.travelMinutes ?? DEFAULT_TRAVEL_MINUTES,
    transportMode: overrides.transportMode ?? "tuk-tuk",
    notes: overrides.notes ?? "",
  }
}

export function createEmptyPlannerState(): PlannerState {
  return {
    tripName: DEFAULT_PLANNER_NAME,
    tripDate: "",
    dayStartTime: DEFAULT_DAY_START_TIME,
    startLocation: DEFAULT_START_LOCATION,
    endLocation: DEFAULT_END_LOCATION,
    items: [],
  }
}

export function plannerStateSignature(plannerState: PlannerState): string {
  return JSON.stringify({
    tripName: plannerState.tripName,
    tripDate: plannerState.tripDate,
    dayStartTime: plannerState.dayStartTime,
    startLocation: plannerState.startLocation,
    endLocation: plannerState.endLocation,
    items: plannerState.items.map((item) => ({
      id: item.id,
      visitDurationMinutes: item.visitDurationMinutes,
      travelMinutes: item.travelMinutes,
      transportMode: item.transportMode,
      notes: item.notes,
    })),
  })
}

export function formatTimeLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const normalizedHours = ((hours % 24) + 24) % 24
  const suffix = normalizedHours >= 12 ? "PM" : "AM"
  const displayHour = normalizedHours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, "0")

  return `${displayHour}:${displayMinutes} ${suffix}`
}

export function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value
    .split(":")
    .map((part) => Number.parseInt(part, 10))

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 8 * 60
  }

  return hours * 60 + minutes
}
