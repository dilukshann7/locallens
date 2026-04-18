"use client"

import { useState } from "react"
import { MapPin, Clock, Plus, Check, Star } from "lucide-react"
import Image from "next/image"
import type { AttractionRecord } from "@/lib/attractions"

type Attraction = AttractionRecord

interface AttractionCardProps {
  attraction: Attraction
  isInPlanner: boolean
  onAddToPlanner: (attraction: Attraction) => void
  onRemoveFromPlanner: (attraction: Attraction) => void
  onSelect: (attraction: Attraction) => void
  index: number
}

const categoryColors: Record<string, string> = {
  nature: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  heritage: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  sightseeing: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  industrial: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  adventure: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
}

export function AttractionCard({
  attraction,
  isInPlanner,
  onAddToPlanner,
  onRemoveFromPlanner,
  onSelect,
  index,
}: AttractionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className="group relative flex animate-in cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/50 transition-all duration-500 fade-in slide-in-from-bottom-3 hover:shadow-xl hover:ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-800/50 dark:hover:ring-zinc-700"
      onClick={() => onSelect(attraction)}
      style={{ animationDelay: `${index * 35}ms` }}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {attraction.primaryImageUrl ? (
          <Image
            src={attraction.primaryImageUrl}
            alt={attraction.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
            <MapPin className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute top-4 left-4 flex gap-2">
          {attraction.isPopular && (
            <div className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-900 backdrop-blur-sm dark:bg-zinc-950/90 dark:text-zinc-50">
              Popular
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (isInPlanner) {
                onRemoveFromPlanner(attraction)
                return
              }

              onAddToPlanner(attraction)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 dark:bg-zinc-950/90 dark:text-zinc-50"
          >
            {isInPlanner ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          {attraction.category && (
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-medium tracking-wider uppercase ${
                categoryColors[attraction.category.slug] ||
                "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {attraction.category.name}
            </span>
          )}
          {attraction.distanceFromBeragalaKm && (
            <span className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-3 w-3" />
              {attraction.distanceFromBeragalaKm} km
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-1 text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
          {attraction.name}
        </h3>

        <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {attraction.shortDescription || attraction.description}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {attraction.suggestedVisitDurationMinutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {attraction.suggestedVisitDurationMinutes}m
              </span>
            )}
            {attraction.reviewCount > 0 && attraction.averageRating ? (
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                {attraction.averageRating.toFixed(1)} ({attraction.reviewCount})
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-zinc-400" />
                No ratings
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
