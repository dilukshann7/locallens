"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "@/lib/auth/client"
import type { AttractionRecord } from "@/lib/attractions"
import {
  createEmptyPlannerState,
  plannerStateSignature,
  toPlannerStop,
  type PlannerState,
  type PlannerStop,
  type PlannerTripSummary,
} from "@/lib/planner-types"

const PLANNER_STORAGE_KEY = "locallens-planner"
const ACTIVE_TRIP_STORAGE_KEY = "locallens-active-trip"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseStoredAttraction(item: unknown): AttractionRecord | null {
  if (!isRecord(item)) {
    return null
  }

  if (typeof item.id !== "string" || typeof item.name !== "string") {
    return null
  }

  return {
    id: item.id,
    name: item.name,
    description: typeof item.description === "string" ? item.description : "",
    shortDescription:
      typeof item.shortDescription === "string"
        ? item.shortDescription
        : undefined,
    categoryId:
      typeof item.categoryId === "string" ? item.categoryId : undefined,
    latitude: typeof item.latitude === "string" ? item.latitude : undefined,
    longitude: typeof item.longitude === "string" ? item.longitude : undefined,
    address: typeof item.address === "string" ? item.address : undefined,
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
      typeof item.weatherNote === "string" ? item.weatherNote : undefined,
    safetyNote:
      typeof item.safetyNote === "string" ? item.safetyNote : undefined,
    isPopular: Boolean(item.isPopular),
    isActive: item.isActive !== false,
    category:
      isRecord(item.category) &&
      typeof item.category.id === "string" &&
      typeof item.category.name === "string" &&
      typeof item.category.slug === "string"
        ? {
            id: item.category.id,
            name: item.category.name,
            slug: item.category.slug,
          }
        : undefined,
  }
}

function parseStoredPlannerStop(item: unknown): PlannerStop | null {
  const attraction = parseStoredAttraction(item)

  if (!attraction || !isRecord(item)) {
    return null
  }

  return toPlannerStop(attraction, {
    visitDurationMinutes:
      typeof item.visitDurationMinutes === "number"
        ? item.visitDurationMinutes
        : attraction.suggestedVisitDurationMinutes,
    travelMinutes:
      typeof item.travelMinutes === "number" ? item.travelMinutes : undefined,
    transportMode:
      item.transportMode === "walk" ||
      item.transportMode === "tuk-tuk" ||
      item.transportMode === "car" ||
      item.transportMode === "bus" ||
      item.transportMode === "train" ||
      item.transportMode === "bike"
        ? item.transportMode
        : undefined,
    notes: typeof item.notes === "string" ? item.notes : undefined,
  })
}

function parseStoredPlannerState(raw: string | null): PlannerState {
  const emptyState = createEmptyPlannerState()

  if (!raw) {
    return emptyState
  }

  try {
    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed)) {
      return {
        ...emptyState,
        items: parsed
          .map(parseStoredPlannerStop)
          .filter((item): item is PlannerStop => Boolean(item)),
      }
    }

    if (!isRecord(parsed)) {
      return emptyState
    }

    return {
      tripName:
        typeof parsed.tripName === "string" && parsed.tripName.trim().length > 0
          ? parsed.tripName
          : emptyState.tripName,
      tripDate: typeof parsed.tripDate === "string" ? parsed.tripDate : "",
      dayStartTime:
        typeof parsed.dayStartTime === "string" &&
        parsed.dayStartTime.length > 0
          ? parsed.dayStartTime
          : emptyState.dayStartTime,
      startLocation:
        typeof parsed.startLocation === "string"
          ? parsed.startLocation
          : emptyState.startLocation,
      endLocation:
        typeof parsed.endLocation === "string"
          ? parsed.endLocation
          : emptyState.endLocation,
      items: Array.isArray(parsed.items)
        ? parsed.items
            .map(parseStoredPlannerStop)
            .filter((item): item is PlannerStop => Boolean(item))
        : [],
    }
  } catch {
    localStorage.removeItem(PLANNER_STORAGE_KEY)
    return emptyState
  }
}

function readPlannerFromStorage(): PlannerState {
  if (typeof window === "undefined") {
    return createEmptyPlannerState()
  }

  return parseStoredPlannerState(localStorage.getItem(PLANNER_STORAGE_KEY))
}

function readActiveTripIdFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const tripId = localStorage.getItem(ACTIVE_TRIP_STORAGE_KEY)
  return tripId && tripId.length > 0 ? tripId : null
}

async function fetchTripsList(): Promise<PlannerTripSummary[]> {
  const response = await fetch("/api/trips", {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch trips")
  }

  const data = (await response.json()) as { trips?: PlannerTripSummary[] }
  return data.trips ?? []
}

async function fetchTrip(tripId: string): Promise<PlannerState> {
  const response = await fetch(`/api/trips/${tripId}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch trip")
  }

  const data = (await response.json()) as { planner?: PlannerState }
  return data.planner ?? createEmptyPlannerState()
}

async function createTrip(plannerState: PlannerState) {
  const response = await fetch("/api/trips", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(plannerState),
  })

  if (!response.ok) {
    throw new Error("Failed to create trip")
  }

  return (await response.json()) as { tripId: string; planner: PlannerState }
}

async function updateTrip(tripId: string, plannerState: PlannerState) {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(plannerState),
  })

  if (!response.ok) {
    throw new Error("Failed to update trip")
  }

  return (await response.json()) as { tripId: string; planner: PlannerState }
}

export function useDayPlanner() {
  const { data: session, isPending } = useSession()
  const [plannerState, setPlannerState] = useState<PlannerState>(
    readPlannerFromStorage
  )
  const [activeTripId, setActiveTripId] = useState<string | null>(
    readActiveTripIdFromStorage
  )
  const [trips, setTrips] = useState<PlannerTripSummary[]>([])
  const [isPlannerLoading, setIsPlannerLoading] = useState(false)
  const [isPlannerSyncing, setIsPlannerSyncing] = useState(false)
  const [isTripListLoading, setIsTripListLoading] = useState(false)
  const initializedUserId = useRef<string | null | undefined>(undefined)
  const lastSavedSignature = useRef(
    plannerStateSignature(readPlannerFromStorage())
  )

  const plannerMode = session?.user?.id ? "account" : "browser"

  useEffect(() => {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plannerState))
  }, [plannerState])

  useEffect(() => {
    if (activeTripId) {
      localStorage.setItem(ACTIVE_TRIP_STORAGE_KEY, activeTripId)
      return
    }

    localStorage.removeItem(ACTIVE_TRIP_STORAGE_KEY)
  }, [activeTripId])

  async function refreshTrips() {
    if (!session?.user?.id) {
      setTrips([])
      return [] as PlannerTripSummary[]
    }

    setIsTripListLoading(true)

    try {
      const nextTrips = await fetchTripsList()
      setTrips(nextTrips)
      return nextTrips
    } catch (error) {
      console.error("Trips refresh failed:", error)
      return [] as PlannerTripSummary[]
    } finally {
      setIsTripListLoading(false)
    }
  }

  async function saveCurrentTrip(asNew = false) {
    if (!session?.user?.id) {
      return null
    }

    setIsPlannerSyncing(true)

    try {
      const result =
        !asNew && activeTripId
          ? await updateTrip(activeTripId, plannerState)
          : await createTrip(plannerState)

      setPlannerState(result.planner)
      setActiveTripId(result.tripId)
      lastSavedSignature.current = plannerStateSignature(result.planner)
      await refreshTrips()

      return result.tripId
    } catch (error) {
      console.error("Trip save failed:", error)
      return null
    } finally {
      setIsPlannerSyncing(false)
    }
  }

  async function loadTrip(tripId: string) {
    if (!session?.user?.id) {
      return false
    }

    setIsPlannerLoading(true)

    try {
      const nextPlanner = await fetchTrip(tripId)
      setPlannerState(nextPlanner)
      setActiveTripId(tripId)
      lastSavedSignature.current = plannerStateSignature(nextPlanner)
      return true
    } catch (error) {
      console.error("Trip load failed:", error)
      return false
    } finally {
      setIsPlannerLoading(false)
    }
  }

  useEffect(() => {
    if (isPending) {
      return
    }

    const userId = session?.user?.id ?? null

    if (initializedUserId.current === userId) {
      return
    }

    initializedUserId.current = userId

    if (!userId) {
      const localState = readPlannerFromStorage()
      setPlannerState(localState)
      setActiveTripId(null)
      setTrips([])
      lastSavedSignature.current = plannerStateSignature(localState)
      return
    }

    setIsPlannerLoading(true)
    setIsTripListLoading(true)

    void (async () => {
      try {
        const localState = readPlannerFromStorage()
        const nextTrips = await fetchTripsList()
        setTrips(nextTrips)

        const storedTripId = readActiveTripIdFromStorage()
        const selectedTripId = nextTrips.some(
          (trip) => trip.id === storedTripId
        )
          ? storedTripId
          : (nextTrips[0]?.id ?? null)

        if (!selectedTripId) {
          setPlannerState(localState)
          setActiveTripId(null)
          lastSavedSignature.current = plannerStateSignature(localState)
          return
        }

        const selectedPlanner = await fetchTrip(selectedTripId)
        setPlannerState(selectedPlanner)
        setActiveTripId(selectedTripId)
        lastSavedSignature.current = plannerStateSignature(selectedPlanner)
      } catch (error) {
        console.error("Planner bootstrap failed:", error)
      } finally {
        setIsPlannerLoading(false)
        setIsTripListLoading(false)
      }
    })()
  }, [isPending, session?.user?.id])

  useEffect(() => {
    if (isPending || isPlannerLoading || !session?.user?.id || !activeTripId) {
      return
    }

    const nextSignature = plannerStateSignature(plannerState)

    if (nextSignature === lastSavedSignature.current) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsPlannerSyncing(true)

        try {
          const result = await updateTrip(activeTripId, plannerState)
          setPlannerState(result.planner)
          lastSavedSignature.current = plannerStateSignature(result.planner)

          try {
            const nextTrips = await fetchTripsList()
            setTrips(nextTrips)
          } catch (error) {
            console.error("Trips refresh failed:", error)
          }
        } catch (error) {
          console.error("Trip autosave failed:", error)
        } finally {
          setIsPlannerSyncing(false)
        }
      })()
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [
    activeTripId,
    isPending,
    isPlannerLoading,
    plannerState,
    session?.user?.id,
  ])

  const plannerSummary = useMemo(() => {
    if (plannerMode === "browser") {
      return "Saved in this browser"
    }

    if (isPlannerSyncing) {
      return activeTripId ? "Saving trip changes" : "Saving new trip"
    }

    return activeTripId ? "Trip saved to your account" : "Draft not saved yet"
  }, [activeTripId, isPlannerSyncing, plannerMode])

  const isInPlanner = (attractionId: string) =>
    plannerState.items.some((item) => item.id === attractionId)

  const addToPlanner = (attraction: AttractionRecord) => {
    setPlannerState((currentState) => {
      if (currentState.items.some((item) => item.id === attraction.id)) {
        return currentState
      }

      return {
        ...currentState,
        items: [...currentState.items, toPlannerStop(attraction)],
      }
    })
  }

  const removeFromPlanner = (attractionId: string) => {
    setPlannerState((currentState) => ({
      ...currentState,
      items: currentState.items.filter((item) => item.id !== attractionId),
    }))
  }

  const reorderPlanner = (items: PlannerStop[]) => {
    setPlannerState((currentState) => ({
      ...currentState,
      items,
    }))
  }

  const updatePlannerItem = (
    attractionId: string,
    patch: Partial<PlannerStop>
  ) => {
    setPlannerState((currentState) => ({
      ...currentState,
      items: currentState.items.map((item) =>
        item.id === attractionId ? { ...item, ...patch } : item
      ),
    }))
  }

  const updatePlannerMeta = (
    patch: Partial<
      Pick<
        PlannerState,
        | "tripName"
        | "tripDate"
        | "dayStartTime"
        | "startLocation"
        | "endLocation"
      >
    >
  ) => {
    setPlannerState((currentState) => ({
      ...currentState,
      ...patch,
    }))
  }

  const clearPlanner = () => {
    setPlannerState((currentState) => ({
      ...currentState,
      items: [],
    }))
  }

  const startNewTrip = () => {
    const emptyState = createEmptyPlannerState()
    setPlannerState(emptyState)
    setActiveTripId(null)
    lastSavedSignature.current = plannerStateSignature(emptyState)
  }

  return {
    plannerState,
    plannerItems: plannerState.items,
    trips,
    activeTripId,
    isInPlanner,
    addToPlanner,
    removeFromPlanner,
    reorderPlanner,
    updatePlannerItem,
    updatePlannerMeta,
    clearPlanner,
    startNewTrip,
    saveCurrentTrip,
    loadTrip,
    refreshTrips,
    plannerMode,
    plannerSummary,
    isPlannerLoading,
    isPlannerSyncing,
    isTripListLoading,
  }
}
