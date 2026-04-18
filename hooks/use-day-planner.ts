"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
    slug: typeof item.slug === "string" ? item.slug : item.id,
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
    primaryImageUrl:
      typeof item.primaryImageUrl === "string"
        ? item.primaryImageUrl
        : undefined,
    openingHours:
      typeof item.openingHours === "string" ? item.openingHours : undefined,
    travelTips:
      typeof item.travelTips === "string" ? item.travelTips : undefined,
    transportInfo:
      typeof item.transportInfo === "string" ? item.transportInfo : undefined,
    accessibilityInfo:
      typeof item.accessibilityInfo === "string"
        ? item.accessibilityInfo
        : undefined,
    crowdLevel:
      typeof item.crowdLevel === "string" ? item.crowdLevel : undefined,
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
    disclaimer:
      typeof item.disclaimer === "string" ? item.disclaimer : undefined,
    isPopular: Boolean(item.isPopular),
    isActive: item.isActive !== false,
    averageRating:
      typeof item.averageRating === "number" ? item.averageRating : undefined,
    reviewCount: typeof item.reviewCount === "number" ? item.reviewCount : 0,
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
  const [hasHydrated, setHasHydrated] = useState(false)
  const [plannerState, setPlannerState] = useState<PlannerState>(
    createEmptyPlannerState
  )
  const [activeTripId, setActiveTripId] = useState<string | null>(null)
  const [trips, setTrips] = useState<PlannerTripSummary[]>([])
  const [isPlannerLoading, setIsPlannerLoading] = useState(false)
  const [isPlannerSyncing, setIsPlannerSyncing] = useState(false)
  const [isTripListLoading, setIsTripListLoading] = useState(false)
  const initializedUserId = useRef<string | null | undefined>(undefined)
  const lastSavedSignature = useRef(
    plannerStateSignature(createEmptyPlannerState())
  )
  const plannerStateRef = useRef<PlannerState>(createEmptyPlannerState())
  const activeTripIdRef = useRef<string | null>(null)
  const autosaveInFlightRef = useRef(false)
  const autosavePendingRef = useRef(false)
  const autosavePromiseRef = useRef<Promise<void> | null>(null)

  const plannerMode = hasHydrated && session?.user?.id ? "account" : "browser"

  useEffect(() => {
    plannerStateRef.current = plannerState
  }, [plannerState])

  useEffect(() => {
    activeTripIdRef.current = activeTripId
  }, [activeTripId])

  useEffect(() => {
    const localState = readPlannerFromStorage()
    const storedTripId = readActiveTripIdFromStorage()
    plannerStateRef.current = localState
    activeTripIdRef.current = storedTripId
    setPlannerState(localState)
    setActiveTripId(storedTripId)
    lastSavedSignature.current = plannerStateSignature(localState)
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plannerState))
  }, [hasHydrated, plannerState])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    if (activeTripId) {
      localStorage.setItem(ACTIVE_TRIP_STORAGE_KEY, activeTripId)
      return
    }

    localStorage.removeItem(ACTIVE_TRIP_STORAGE_KEY)
  }, [activeTripId, hasHydrated])

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

  const saveLatestTripChanges = useCallback(async () => {
    if (!session?.user?.id || !activeTripIdRef.current) {
      return
    }

    if (autosaveInFlightRef.current) {
      autosavePendingRef.current = true
      await autosavePromiseRef.current
      return
    }

    autosaveInFlightRef.current = true
    setIsPlannerSyncing(true)

    const autosavePromise = (async () => {
      try {
        do {
          autosavePendingRef.current = false

          const tripId = activeTripIdRef.current
          const submittedPlanner = plannerStateRef.current
          const submittedSignature = plannerStateSignature(submittedPlanner)

          if (
            !tripId ||
            submittedSignature === lastSavedSignature.current
          ) {
            break
          }

          const result = await updateTrip(tripId, submittedPlanner)
          lastSavedSignature.current = submittedSignature

          const currentSignature = plannerStateSignature(
            plannerStateRef.current
          )

          if (
            activeTripIdRef.current === tripId &&
            currentSignature === submittedSignature
          ) {
            plannerStateRef.current = result.planner
            setPlannerState(result.planner)
            lastSavedSignature.current = plannerStateSignature(result.planner)
          }

          try {
            const nextTrips = await fetchTripsList()
            setTrips(nextTrips)
          } catch (error) {
            console.error("Trips refresh failed:", error)
          }
        } while (
          autosavePendingRef.current ||
          plannerStateSignature(plannerStateRef.current) !==
            lastSavedSignature.current
        )
      } catch (error) {
        console.error("Trip autosave failed:", error)
      } finally {
        autosaveInFlightRef.current = false
        autosavePromiseRef.current = null
        setIsPlannerSyncing(false)
      }
    })()

    autosavePromiseRef.current = autosavePromise
    await autosavePromise
  }, [session?.user?.id])

  async function saveCurrentTrip(asNew = false) {
    if (!session?.user?.id) {
      return null
    }

    if (!asNew && activeTripIdRef.current) {
      await saveLatestTripChanges()
      return activeTripIdRef.current
    }

    const submittedPlanner = plannerStateRef.current
    const submittedSignature = plannerStateSignature(submittedPlanner)

    setIsPlannerSyncing(true)

    try {
      const result = await createTrip(submittedPlanner)
      activeTripIdRef.current = result.tripId
      setActiveTripId(result.tripId)

      const currentSignature = plannerStateSignature(plannerStateRef.current)
      lastSavedSignature.current = submittedSignature

      if (currentSignature === submittedSignature) {
        plannerStateRef.current = result.planner
        setPlannerState(result.planner)
        lastSavedSignature.current = plannerStateSignature(result.planner)
      } else {
        void saveLatestTripChanges()
      }

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
      plannerStateRef.current = nextPlanner
      activeTripIdRef.current = tripId
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
    if (!hasHydrated || isPending) {
      return
    }

    const userId = session?.user?.id ?? null

    if (initializedUserId.current === userId) {
      return
    }

    initializedUserId.current = userId

    if (!userId) {
      const localState = readPlannerFromStorage()
      plannerStateRef.current = localState
      activeTripIdRef.current = null
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
          plannerStateRef.current = localState
          activeTripIdRef.current = null
          setPlannerState(localState)
          setActiveTripId(null)
          lastSavedSignature.current = plannerStateSignature(localState)
          return
        }

        const selectedPlanner = await fetchTrip(selectedTripId)
        plannerStateRef.current = selectedPlanner
        activeTripIdRef.current = selectedTripId
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
  }, [hasHydrated, isPending, session?.user?.id])

  useEffect(() => {
    if (
      !hasHydrated ||
      isPending ||
      isPlannerLoading ||
      !session?.user?.id ||
      !activeTripId
    ) {
      return
    }

    const nextSignature = plannerStateSignature(plannerState)

    if (nextSignature === lastSavedSignature.current) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void saveLatestTripChanges()
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [
    activeTripId,
    hasHydrated,
    isPending,
    isPlannerLoading,
    plannerState,
    saveLatestTripChanges,
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

      const nextState = {
        ...currentState,
        items: [...currentState.items, toPlannerStop(attraction)],
      }
      plannerStateRef.current = nextState
      return nextState
    })
  }

  const removeFromPlanner = (attractionId: string) => {
    setPlannerState((currentState) => {
      const nextState = {
        ...currentState,
        items: currentState.items.filter((item) => item.id !== attractionId),
      }
      plannerStateRef.current = nextState
      return nextState
    })
  }

  const reorderPlanner = (items: PlannerStop[]) => {
    setPlannerState((currentState) => {
      const nextState = {
        ...currentState,
        items,
      }
      plannerStateRef.current = nextState
      return nextState
    })
  }

  const updatePlannerItem = (
    attractionId: string,
    patch: Partial<PlannerStop>
  ) => {
    setPlannerState((currentState) => {
      const nextState = {
        ...currentState,
        items: currentState.items.map((item) =>
          item.id === attractionId ? { ...item, ...patch } : item
        ),
      }
      plannerStateRef.current = nextState
      return nextState
    })
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
    setPlannerState((currentState) => {
      const nextState = {
        ...currentState,
        ...patch,
      }
      plannerStateRef.current = nextState
      return nextState
    })
  }

  const clearPlanner = () => {
    setPlannerState((currentState) => {
      const nextState = {
        ...currentState,
        items: [],
      }
      plannerStateRef.current = nextState
      return nextState
    })
  }

  const startNewTrip = () => {
    const emptyState = createEmptyPlannerState()
    plannerStateRef.current = emptyState
    activeTripIdRef.current = null
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
