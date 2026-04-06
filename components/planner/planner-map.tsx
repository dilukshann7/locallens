"use client"

import { useEffect, useMemo, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet"
import { divIcon } from "leaflet"
import "leaflet/dist/leaflet.css"
import type { PlannerStop } from "@/lib/planner-types"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface RoutableWaypoint {
  item: PlannerStop
  latitude: number
  longitude: number
  plannerIndex: number
}

interface RoutedSegment {
  key: string
  from: RoutableWaypoint
  to: RoutableWaypoint
  distanceKm: number
  durationMinutes: number
  coordinates: [number, number][]
}

interface PlannerMapProps {
  items: PlannerStop[]
  startLocation?: string
  endLocation?: string
  className?: string
}

function getRouteProfile(transportMode: PlannerStop["transportMode"]) {
  if (transportMode === "walk") {
    return "walking"
  }

  if (transportMode === "bike") {
    return "cycling"
  }

  return "driving"
}

function formatDurationLabel(durationMinutes: number) {
  if (durationMinutes < 60) {
    return `${Math.max(1, Math.round(durationMinutes))} min`
  }

  const hours = Math.floor(durationMinutes / 60)
  const minutes = Math.round(durationMinutes % 60)

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

function createNumberedMarkerIcon(number: number, color: string) {
  return divIcon({
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 13px;
        font-weight: bold;
      ">
        ${number}
      </div>
    `,
    className: "custom-numbered-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

function MapBoundsUpdater({
  coordinates,
}: {
  coordinates: [number, number][]
}) {
  const map = useMap()

  useEffect(() => {
    if (coordinates.length > 0) {
      if (coordinates.length === 1) {
        map.setView(coordinates[0], 13)
      } else {
        map.fitBounds(coordinates, { padding: [40, 40], maxZoom: 15 })
      }
    }
  }, [coordinates, map])

  return null
}

export function PlannerMap({
  items,
  startLocation,
  endLocation,
  className,
}: PlannerMapProps) {
  const { resolvedTheme } = useTheme()
  const center: [number, number] = [6.78, 80.78]
  const routeWaypoints = useMemo(
    () =>
      items.reduce<RoutableWaypoint[]>((result, item, plannerIndex) => {
        const latitude = Number.parseFloat(item.latitude ?? "")
        const longitude = Number.parseFloat(item.longitude ?? "")

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return result
        }

        return [
          ...result,
          {
            item,
            latitude,
            longitude,
            plannerIndex,
          },
        ]
      }, []),
    [items]
  )
  const [routedSegments, setRoutedSegments] = useState<RoutedSegment[]>([])
  const [isRouting, setIsRouting] = useState(false)

  const routeCoordinates = routeWaypoints.map(
    (waypoint) => [waypoint.latitude, waypoint.longitude] as [number, number]
  )
  const routedCoordinates = routedSegments.flatMap((segment, index) =>
    index === 0 ? segment.coordinates : segment.coordinates.slice(1)
  )
  const displayCoordinates =
    routedCoordinates.length > 1 ? routedCoordinates : routeCoordinates
  const skippedStops = items.length - routeWaypoints.length
  const totalDistanceKm = routedSegments.reduce(
    (sum, segment) => sum + segment.distanceKm,
    0
  )

  const isDark = resolvedTheme === "dark"

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

  useEffect(() => {
    if (routeWaypoints.length < 2) {
      setRoutedSegments([])
      setIsRouting(false)
      return
    }

    const abortController = new AbortController()
    setIsRouting(true)

    void (async () => {
      try {
        const resolvedSegments = await Promise.all(
          routeWaypoints.slice(0, -1).map(async (from, index) => {
            const to = routeWaypoints[index + 1]!
            const profile = getRouteProfile(from.item.transportMode)
            const coordinates = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`,
              {
                signal: abortController.signal,
              }
            )

            if (!response.ok) {
              throw new Error(`Routing request failed with ${response.status}`)
            }

            const data = (await response.json()) as {
              code?: string
              routes?: Array<{
                distance?: number
                duration?: number
                geometry?: {
                  coordinates?: number[][]
                }
              }>
            }
            const route = data.routes?.[0]
            const geometry = route?.geometry?.coordinates

            if (
              data.code !== "Ok" ||
              !route ||
              !geometry ||
              geometry.length < 2
            ) {
              throw new Error("No routed geometry returned")
            }

            return {
              key: `${from.item.id}-${to.item.id}`,
              from,
              to,
              distanceKm: (route.distance ?? 0) / 1000,
              durationMinutes: (route.duration ?? 0) / 60,
              coordinates: geometry.map(
                ([longitude, latitude]) =>
                  [latitude, longitude] as [number, number]
              ),
            } satisfies RoutedSegment
          })
        )

        setRoutedSegments(resolvedSegments)
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Failed to fetch routed planner segments:", error)
          setRoutedSegments([])
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsRouting(false)
        }
      }
    })()

    return () => {
      abortController.abort()
    }
  }, [routeWaypoints])

  return (
    <div
      className={cn("relative z-0 h-full w-full overflow-hidden", className)}
    >
      {routeWaypoints.length > 0 && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-500 flex justify-start">
          <div className="pointer-events-auto w-full max-w-sm rounded-[1.25rem] border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur-md dark:border-zinc-700/70 dark:bg-zinc-950/85">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black tracking-[0.22em] text-emerald-600 uppercase dark:text-emerald-400">
                  Route Directions
                </p>
                <h3 className="mt-1 text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                  Road route preview
                </h3>
              </div>
              <div className="rounded-xl bg-emerald-50 px-2.5 py-1 text-right dark:bg-emerald-500/10">
                <div className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                  {routedSegments.length > 0 ? "OSRM" : "Map"}
                </div>
                <div className="text-sm font-black text-emerald-900 dark:text-emerald-50">
                  {routedSegments.length > 0
                    ? `${totalDistanceKm.toFixed(1)} km`
                    : routeWaypoints.length > 1
                      ? "Loading"
                      : "Ready"}
                </div>
              </div>
            </div>

            {isRouting && (
              <p className="mt-2 text-[11px] leading-relaxed font-medium text-blue-700 dark:text-blue-300">
                Fetching road-following directions...
              </p>
            )}

            {(startLocation || endLocation) && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {startLocation && (
                  <div className="rounded-xl bg-blue-50/90 px-3 py-2 text-[11px] dark:bg-blue-500/10">
                    <div className="font-bold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                      Day starts
                    </div>
                    <div className="mt-1 font-medium text-zinc-700 dark:text-zinc-200">
                      {startLocation}
                    </div>
                  </div>
                )}
                {endLocation && (
                  <div className="rounded-xl bg-amber-50/90 px-3 py-2 text-[11px] dark:bg-amber-500/10">
                    <div className="font-bold tracking-wide text-amber-700 uppercase dark:text-amber-300">
                      Day ends
                    </div>
                    <div className="mt-1 font-medium text-zinc-700 dark:text-zinc-200">
                      {endLocation}
                    </div>
                  </div>
                )}
              </div>
            )}

            {skippedStops > 0 && (
              <p className="mt-2 text-[11px] leading-relaxed font-medium text-amber-700 dark:text-amber-300">
                {skippedStops} stop
                {skippedStops === 1 ? "" : "s"} skipped because coordinates are
                missing.
              </p>
            )}

            {routedSegments.length > 0 ? (
              <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {routedSegments.map((segment, index) => (
                  <div
                    key={segment.key}
                    className="rounded-xl bg-zinc-50/90 px-3 py-2 text-[11px] dark:bg-zinc-900/80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-zinc-900 dark:text-zinc-50">
                        {index + 1}. {segment.from.item.name}
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {segment.distanceKm.toFixed(1)} km
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-zinc-600 dark:text-zinc-300">
                      Travel to {segment.to.item.name}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                      {segment.from.item.transportMode} •{" "}
                      {formatDurationLabel(segment.durationMinutes)}
                    </p>
                  </div>
                ))}
              </div>
            ) : routeWaypoints.length < 2 ? (
              <p className="mt-3 rounded-xl bg-zinc-50/90 px-3 py-2 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-300">
                Add at least two stops with map coordinates to draw directions.
              </p>
            ) : !isRouting ? (
              <p className="mt-3 rounded-xl bg-zinc-50/90 px-3 py-2 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-300">
                OSRM directions are unavailable right now. The map still shows
                your planner stops.
              </p>
            ) : (
              <p className="mt-3 rounded-xl bg-zinc-50/90 px-3 py-2 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-300">
                Fetching road directions...
              </p>
            )}
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={11}
        className="z-0 h-full w-full bg-zinc-100 dark:bg-zinc-900"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url={tileUrl}
        />
        <MapBoundsUpdater coordinates={displayCoordinates} />

        {displayCoordinates.length > 1 && (
          <Polyline
            positions={displayCoordinates}
            pathOptions={{ color: "#10b981", weight: 5, opacity: 0.82 }}
          />
        )}

        {routeWaypoints.map((waypoint, index) => {
          const color =
            index === 0
              ? "#2563eb"
              : index === routeWaypoints.length - 1
                ? "#f59e0b"
                : "#10b981"
          const routedSegment = routedSegments[index]

          return (
            <Marker
              key={waypoint.item.id}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={createNumberedMarkerIcon(waypoint.plannerIndex + 1, color)}
            >
              <Popup className="font-sans">
                <div className="min-w-45 p-1">
                  <div className="mb-1 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                    Planner stop {waypoint.plannerIndex + 1}
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold tracking-tight text-zinc-900">
                    {waypoint.item.name}
                  </h3>
                  <div className="flex flex-col gap-1 text-[11px] font-medium text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Route point {index + 1}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {waypoint.item.visitDurationMinutes} min stay
                    </span>
                    {routedSegment && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        Next: {routedSegment.distanceKm.toFixed(1)} km to{" "}
                        {routedSegment.to.item.name}
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
