"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { AttractionCard } from "@/components/explorer/attraction-card"
import { CategoryFilter } from "@/components/explorer/category-filter"
import { SearchInput } from "@/components/explorer/search-input"
import { DayPlanner, type PlannerItem } from "@/components/planner/day-planner"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  CalendarDays,
  Map as MapIcon,
  LayoutGrid,
  MapPin,
  Clock,
  Info,
  ShieldAlert,
  CloudRain,
} from "lucide-react"
import Image from "next/image"
import { useDayPlanner } from "@/hooks/use-day-planner"
import type { AttractionRecord, CategoryRecord } from "@/lib/attractions"

const AttractionMap = dynamic(
  () =>
    import("@/components/explorer/attraction-map").then(
      (mod) => mod.AttractionMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="relative z-0 h-[calc(100vh-250px)] min-h-125 overflow-hidden rounded-3xl border border-zinc-200 shadow-sm dark:border-zinc-800">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    ),
  }
)

interface TouristExplorerProps {
  attractions: AttractionRecord[]
  categories: CategoryRecord[]
}

export function TouristExplorer({
  attractions,
  categories,
}: TouristExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [selectedAttraction, setSelectedAttraction] =
    useState<AttractionRecord | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [isScrolled, setIsScrolled] = useState(false)
  const {
    plannerItems,
    isInPlanner,
    addToPlanner,
    removeFromPlanner,
    reorderPlanner,
    clearPlanner,
    plannerMode,
    plannerSummary,
  } = useDayPlanner()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const filteredAttractions = useMemo(() => {
    return attractions.filter((attraction) => {
      const matchesCategory =
        !selectedCategory || attraction.category?.slug === selectedCategory

      const matchesSearch =
        !deferredSearchQuery ||
        attraction.name
          .toLowerCase()
          .includes(deferredSearchQuery.toLowerCase()) ||
        attraction.shortDescription
          ?.toLowerCase()
          .includes(deferredSearchQuery.toLowerCase()) ||
        attraction.description
          ?.toLowerCase()
          .includes(deferredSearchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [attractions, deferredSearchQuery, selectedCategory])

  const handleAddToPlanner = (attraction: AttractionRecord) => {
    addToPlanner(attraction)
  }

  const handleRemoveFromPlanner = (item: AttractionRecord) => {
    removeFromPlanner(item.id)
  }

  const handleReorder = (items: PlannerItem[]) => {
    reorderPlanner(items)
  }

  const handlePlannerToggle = (attraction: AttractionRecord) => {
    if (isInPlanner(attraction.id)) {
      removeFromPlanner(attraction.id)
      return
    }

    addToPlanner(attraction)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <Link
                href="/map"
                className="hidden rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 md:inline-flex dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-zinc-50"
              >
                Map
              </Link>
              <ThemeToggle />
              <div className="flex items-center rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
                >
                  <LayoutGrid className="mr-1.5 h-4 w-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    viewMode === "map"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
                >
                  <MapIcon className="mr-1.5 h-4 w-4" />
                  Map
                </button>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <button className="relative flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-zinc-800 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Planner
                    {plannerItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                        {plannerItems.length}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <SheetTitle>Your Itinerary</SheetTitle>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {plannerSummary}
                        </p>
                      </div>
                      <Link
                        href="/planner"
                        className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-zinc-50"
                      >
                        Open Full Planner
                      </Link>
                    </div>
                  </SheetHeader>
                  <div className="mt-6 h-full">
                    <DayPlanner
                      items={plannerItems}
                      onReorder={handleReorder}
                      onRemove={handleRemoveFromPlanner}
                      onClear={clearPlanner}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Link
                href="/planner"
                className="hidden rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 md:inline-flex dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-zinc-50"
              >
                {plannerMode === "account" ? "Synced Plan" : "Full Plan"}
              </Link>
            </div>
          </div>

          <div className="mt-4 pb-2">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Sheet
          open={!!selectedAttraction}
          onOpenChange={(open) => !open && setSelectedAttraction(null)}
        >
          <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-lg">
            <SheetTitle className="sr-only">
              {selectedAttraction?.name || "Attraction Details"}
            </SheetTitle>
            {selectedAttraction && (
              <div className="flex h-full min-h-0 flex-col bg-white dark:bg-zinc-950">
                <div className="relative h-72 w-full shrink-0 bg-zinc-100 dark:bg-zinc-900">
                  {selectedAttraction.primaryImageUrl ? (
                    <Image
                      src={selectedAttraction.primaryImageUrl}
                      alt={selectedAttraction.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <MapPin className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 p-6 text-white">
                    {selectedAttraction.category && (
                      <span className="mb-2 inline-block rounded-md bg-white/20 px-2 py-1 text-xs font-medium tracking-wider uppercase backdrop-blur-md">
                        {selectedAttraction.category.name}
                      </span>
                    )}
                    <h2 className="text-3xl font-bold tracking-tight">
                      {selectedAttraction.name}
                    </h2>
                    {selectedAttraction.address && (
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-300">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedAttraction.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-8 overflow-y-auto p-6 pb-8">
                  <div className="flex flex-wrap gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    {selectedAttraction.distanceFromBeragalaKm && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Distance
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                          {selectedAttraction.distanceFromBeragalaKm} km
                        </span>
                      </div>
                    )}
                    {selectedAttraction.suggestedVisitDurationMinutes && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Duration
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          <Clock className="h-4 w-4 text-sky-500" />
                          {
                            selectedAttraction.suggestedVisitDurationMinutes
                          }{" "}
                          mins
                        </span>
                      </div>
                    )}
                    {selectedAttraction.bestTimeToVisit && (
                      <div className="flex w-full flex-col gap-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Best time to visit
                        </span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {selectedAttraction.bestTimeToVisit}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      <Info className="h-5 w-5 text-zinc-400" />
                      About this place
                    </h3>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-600 dark:text-zinc-300">
                      {selectedAttraction.description}
                    </p>
                  </div>

                  {(selectedAttraction.safetyNote ||
                    selectedAttraction.weatherNote) && (
                    <div className="space-y-4">
                      {selectedAttraction.safetyNote && (
                        <div className="flex gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-900/10">
                          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                          <div>
                            <h4 className="text-sm font-medium text-rose-900 dark:text-rose-200">
                              Safety Information
                            </h4>
                            <p className="mt-1 text-sm text-rose-700 dark:text-rose-300/80">
                              {selectedAttraction.safetyNote}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedAttraction.weatherNote && (
                        <div className="flex gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-900/30 dark:bg-sky-900/10">
                          <CloudRain className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
                          <div>
                            <h4 className="text-sm font-medium text-sky-900 dark:text-sky-200">
                              Weather Note
                            </h4>
                            <p className="mt-1 text-sm text-sky-700 dark:text-sky-300/80">
                              {selectedAttraction.weatherNote}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedAttraction.images &&
                    selectedAttraction.images.length > 1 && (
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          Gallery
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedAttraction.images
                            .slice(1)
                            .map((img, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
                              >
                                <Image
                                  src={img}
                                  alt={`${selectedAttraction.name} ${idx + 2}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-zinc-200/70 bg-white/95 p-4 shadow-[0_-18px_40px_rgba(24,24,27,0.08)] backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/95 dark:shadow-[0_-18px_40px_rgba(0,0,0,0.35)]">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => handlePlannerToggle(selectedAttraction)}
                      className={`rounded-xl py-3.5 text-sm font-semibold shadow-sm transition-all active:scale-[0.98] ${
                        isInPlanner(selectedAttraction.id)
                          ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      }`}
                    >
                      {isInPlanner(selectedAttraction.id)
                        ? "Remove from Planner"
                        : "Add to Planner"}
                    </button>
                    <Link
                      href={`/attractions/${selectedAttraction.slug}`}
                      className="flex items-center justify-center rounded-xl border border-zinc-200 py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:text-zinc-50"
                    >
                      Open Full Guide
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {viewMode === "grid" ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Explore Places
              </h2>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {filteredAttractions.length} destinations
              </p>
            </div>

            {filteredAttractions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-32 text-center dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  No matches found
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Try adjusting your search or filters to find what you&apos;re
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSearchQuery("")
                  }}
                  className="mt-6 font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAttractions.map((attraction, index) => (
                  <AttractionCard
                    key={attraction.id}
                    attraction={attraction}
                    isInPlanner={isInPlanner(attraction.id)}
                    onAddToPlanner={handleAddToPlanner}
                    onRemoveFromPlanner={handleRemoveFromPlanner}
                    onSelect={setSelectedAttraction}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="relative z-0 h-[calc(100vh-250px)] min-h-125 overflow-hidden rounded-3xl border border-zinc-200 shadow-sm dark:border-zinc-800">
            <AttractionMap
              attractions={filteredAttractions}
              selectedAttraction={selectedAttraction}
              onSelectAttraction={setSelectedAttraction}
            />
          </div>
        )}
      </div>
    </div>
  )
}
