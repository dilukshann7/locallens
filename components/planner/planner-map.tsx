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

interface StopWaypoint {
  kind: "stop"
  key: string
  item: PlannerStop
  latitude: number
  longitude: number
  plannerIndex: number
}

interface EndpointWaypoint {
  kind: "start" | "end"
  key: string
  label: string
  latitude: number
  longitude: number
}

type MapWaypoint = StopWaypoint | EndpointWaypoint

interface RoutedSegment {
  key: string
  from: MapWaypoint
  to: MapWaypoint
  distanceKm: number
  durationMinutes: number
  coordinates: [number, number][]
}

interface GeocodedLocation {
  label: string
  latitude: number
  longitude: number
}

type GoogleDirectionsPoint =
  | {
      kind: "coordinate"
      latitude: number
      longitude: number
    }
  | {
      kind: "query"
      value: string
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

function getWaypointLabel(waypoint: MapWaypoint) {
  return waypoint.kind === "stop" ? waypoint.item.name : waypoint.label
}

function isStopWaypoint(waypoint: MapWaypoint): waypoint is StopWaypoint {
  return waypoint.kind === "stop"
}

function getWaypointMarkerLabel(waypoint: MapWaypoint) {
  if (isStopWaypoint(waypoint)) {
    return waypoint.plannerIndex + 1
  }

  if (waypoint.kind === "start") {
    return "S"
  }

  return "E"
}

function getWaypointTypeLabel(waypoint: MapWaypoint) {
  if (isStopWaypoint(waypoint)) {
    return `Planner stop ${waypoint.plannerIndex + 1}`
  }

  if (waypoint.kind === "start") {
    return "Day starts"
  }

  return "Day ends"
}

function getWaypointTransportMode(
  waypoint: MapWaypoint,
  fallbackStop?: StopWaypoint
) {
  if (waypoint.kind === "stop") {
    return waypoint.item.transportMode
  }

  return fallbackStop?.item.transportMode ?? "tuk-tuk"
}

function formatCoordinatePoint(latitude: number, longitude: number) {
  return `${latitude},${longitude}`
}

function formatGoogleDirectionsPoint(point: GoogleDirectionsPoint) {
  return point.kind === "coordinate"
    ? formatCoordinatePoint(point.latitude, point.longitude)
    : point.value
}

function createGoogleDirectionsUrl(points: GoogleDirectionsPoint[]) {
  if (points.length < 2) {
    return null
  }

  const params = new URLSearchParams({
    api: "1",
    origin: formatGoogleDirectionsPoint(points[0]!),
    destination: formatGoogleDirectionsPoint(points[points.length - 1]!),
    travelmode: "driving",
  })
  const waypoints = points
    .slice(1, -1)
    .map(formatGoogleDirectionsPoint)
    .join("|")

  if (waypoints) {
    params.set("waypoints", waypoints)
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

function createNumberedMarkerIcon(label: string | number, color: string) {
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
        ${label}
      </div>
    `,
    className: "custom-numbered-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

async function geocodeSriLankaLocation(
  location: string,
  signal: AbortSignal
): Promise<GeocodedLocation | null> {
  const query = location.toLowerCase().includes("sri lanka")
    ? location
    : `${location}, Sri Lanka`
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    countrycodes: "lk",
    q: query,
  })
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { signal }
  )

  if (!response.ok) {
    throw new Error(`Geocoding failed with ${response.status}`)
  }

  const data = (await response.json()) as Array<{
    display_name?: string
    lat?: string
    lon?: string
  }>
  const result = data[0]
  const latitude = Number.parseFloat(result?.lat ?? "")
  const longitude = Number.parseFloat(result?.lon ?? "")

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return {
    label: location,
    latitude,
    longitude,
  }
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
  const stopWaypoints = useMemo(
    () =>
      items.reduce<StopWaypoint[]>((result, item, plannerIndex) => {
        const latitude = Number.parseFloat(item.latitude ?? "")
        const longitude = Number.parseFloat(item.longitude ?? "")

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return result
        }

        return [
          ...result,
          {
            kind: "stop",
            key: `stop-${item.id}`,
            item,
            latitude,
            longitude,
            plannerIndex,
          },
        ]
      }, []),
    [items]
  )
  const [startPoint, setStartPoint] = useState<GeocodedLocation | null>(null)
  const [endPoint, setEndPoint] = useState<GeocodedLocation | null>(null)
  const [routedSegments, setRoutedSegments] = useState<RoutedSegment[]>([])

  const mapWaypoints = useMemo<MapWaypoint[]>(
    () => [
      ...(startPoint
        ? [
            {
              kind: "start" as const,
              key: "day-start",
              label: startPoint.label,
              latitude: startPoint.latitude,
              longitude: startPoint.longitude,
            },
          ]
        : []),
      ...stopWaypoints,
      ...(endPoint
        ? [
            {
              kind: "end" as const,
              key: "day-end",
              label: endPoint.label,
              latitude: endPoint.latitude,
              longitude: endPoint.longitude,
            },
          ]
        : []),
    ],
    [endPoint, startPoint, stopWaypoints]
  )

  const routeCoordinates = mapWaypoints.map(
    (waypoint) => [waypoint.latitude, waypoint.longitude] as [number, number]
  )
  const routedCoordinates = routedSegments.flatMap((segment, index) =>
    index === 0 ? segment.coordinates : segment.coordinates.slice(1)
  )
  const displayCoordinates =
    routedCoordinates.length > 1 ? routedCoordinates : routeCoordinates
  const googleDirectionsUrl = useMemo(() => {
    const points: GoogleDirectionsPoint[] = []
    const normalizedStart = startLocation?.trim()
    const normalizedEnd = endLocation?.trim()

    if (normalizedStart) {
      points.push(
        startPoint
          ? {
              kind: "coordinate",
              latitude: startPoint.latitude,
              longitude: startPoint.longitude,
            }
          : {
              kind: "query",
              value: normalizedStart,
            }
      )
    }

    points.push(
      ...stopWaypoints.map((waypoint) => ({
        kind: "coordinate" as const,
        latitude: waypoint.latitude,
        longitude: waypoint.longitude,
      }))
    )

    if (normalizedEnd) {
      points.push(
        endPoint
          ? {
              kind: "coordinate",
              latitude: endPoint.latitude,
              longitude: endPoint.longitude,
            }
          : {
              kind: "query",
              value: normalizedEnd,
            }
      )
    }

    return createGoogleDirectionsUrl(points)
  }, [endLocation, endPoint, startLocation, startPoint, stopWaypoints])
  const isDark = resolvedTheme === "dark"

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

  useEffect(() => {
    const abortController = new AbortController()
    const normalizedStart = startLocation?.trim() ?? ""
    const normalizedEnd = endLocation?.trim() ?? ""

    void (async () => {
      try {
        const [nextStartPoint, nextEndPoint] = await Promise.all([
          normalizedStart
            ? geocodeSriLankaLocation(normalizedStart, abortController.signal)
            : Promise.resolve(null),
          normalizedEnd
            ? geocodeSriLankaLocation(normalizedEnd, abortController.signal)
            : Promise.resolve(null),
        ])

        if (!abortController.signal.aborted) {
          setStartPoint(nextStartPoint)
          setEndPoint(nextEndPoint)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Failed to geocode planner endpoints:", error)
          setStartPoint(null)
          setEndPoint(null)
        }
      }
    })()

    return () => {
      abortController.abort()
    }
  }, [endLocation, startLocation])

  useEffect(() => {
    if (mapWaypoints.length < 2) {
      queueMicrotask(() => setRoutedSegments([]))
      return
    }

    const abortController = new AbortController()

    void (async () => {
      try {
        const resolvedSegments = await Promise.all(
          mapWaypoints.slice(0, -1).map(async (from, index) => {
            const to = mapWaypoints[index + 1]!
            const profile = getRouteProfile(
              getWaypointTransportMode(from, stopWaypoints[index])
            )
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
              key: `${from.key}-${to.key}`,
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
      }
    })()

    return () => {
      abortController.abort()
    }
  }, [mapWaypoints, stopWaypoints])

  return (
    <div
      className={cn("relative z-0 h-full w-full overflow-hidden", className)}
    >
      {googleDirectionsUrl && (
        <div className="pointer-events-none absolute top-3 right-3 z-500">
          <a
            href={googleDirectionsUrl}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Open in Google Maps
          </a>
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

        {mapWaypoints.map((waypoint, index) => {
          const color =
            waypoint.kind === "start"
              ? "#2563eb"
              : waypoint.kind === "end"
                ? "#f59e0b"
                : "#10b981"
          const label = getWaypointMarkerLabel(waypoint)
          const routedSegment = routedSegments[index]

          return (
            <Marker
              key={waypoint.key}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={createNumberedMarkerIcon(label, color)}
            >
              <Popup className="font-sans">
                <div className="min-w-45 p-1">
                  <div className="mb-1 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                    {getWaypointTypeLabel(waypoint)}
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold tracking-tight text-zinc-900">
                    {getWaypointLabel(waypoint)}
                  </h3>
                  <div className="flex flex-col gap-1 text-[11px] font-medium text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Route point {index + 1}
                    </span>
                    {waypoint.kind === "stop" && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {waypoint.item.visitDurationMinutes} min stay
                      </span>
                    )}
                    {routedSegment && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        Next: {routedSegment.distanceKm.toFixed(1)} km to{" "}
                        {getWaypointLabel(routedSegment.to)}
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
