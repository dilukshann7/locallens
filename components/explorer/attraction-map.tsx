"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { divIcon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AttractionRecord } from "@/lib/attractions"

type Attraction = AttractionRecord

interface AttractionMapProps {
  attractions: Attraction[]
  selectedAttraction: Attraction | null
  onSelectAttraction: (attraction: Attraction | null) => void
  className?: string
}

const categoryColors: Record<string, string> = {
  nature: "#10b981",
  heritage: "#f59e0b",
  sightseeing: "#0ea5e9",
  industrial: "#f97316",
  adventure: "#f43f5e",
}

function createMarkerIcon(color: string) {
  return divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">📍</div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

function MapUpdater({
  selectedAttraction,
}: {
  selectedAttraction: Attraction | null
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedAttraction?.latitude && selectedAttraction?.longitude) {
      map.flyTo(
        [
          parseFloat(selectedAttraction.latitude),
          parseFloat(selectedAttraction.longitude),
        ],
        13,
        { duration: 0.5 }
      )
    }
  }, [selectedAttraction, map])

  return null
}

export function AttractionMap({
  attractions,
  selectedAttraction,
  onSelectAttraction,
  className,
}: AttractionMapProps) {
  const center: [number, number] = [6.78, 80.78]

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Explore on Map
          <Badge variant="secondary" className="ml-auto">
            {attractions.length} places
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-100">
          <MapContainer
            center={center}
            zoom={11}
            className="z-0 h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater selectedAttraction={selectedAttraction} />
            {attractions.map((attraction) => {
              const color =
                categoryColors[attraction.category?.slug || "sightseeing"]
              const lat = attraction.latitude
                ? parseFloat(attraction.latitude)
                : 0
              const lng = attraction.longitude
                ? parseFloat(attraction.longitude)
                : 0

              if (!attraction.latitude || !attraction.longitude) return null

              return (
                <Marker
                  key={attraction.id}
                  position={[lat, lng]}
                  icon={createMarkerIcon(color)}
                  eventHandlers={{
                    click: () => onSelectAttraction(attraction),
                  }}
                >
                  <Popup>
                    <div className="min-w-50 p-1">
                      <h3 className="mb-1 text-sm font-semibold">
                        {attraction.name}
                      </h3>
                      {attraction.shortDescription && (
                        <p className="mb-2 line-clamp-2 text-xs text-gray-600">
                          {attraction.shortDescription}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {attraction.distanceFromBeragalaKm && (
                          <span>{attraction.distanceFromBeragalaKm} km</span>
                        )}
                        {attraction.suggestedVisitDurationMinutes && (
                          <span>
                            {attraction.suggestedVisitDurationMinutes} min
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
      </CardContent>
    </Card>
  )
}
