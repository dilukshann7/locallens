"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  CirclePlus,
  Clock3,
  Compass,
  FolderOpen,
  History,
  LogIn,
  LogOut,
  Map,
  MapPin,
  Menu,
  Plus,
  RefreshCcw,
  Save,
  Settings2,
  Ticket,
  Trash2,
  UserPlus,
  CarFront,
  ListOrdered,
} from "lucide-react"
import { DayPlanner } from "@/components/planner/day-planner"
const PlannerMap = dynamic(
  () =>
    import("@/components/planner/planner-map").then((mod) => mod.PlannerMap),
  { ssr: false }
)
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { signOut } from "@/lib/auth/client"
import { useDayPlanner } from "@/hooks/use-day-planner"
import type { AttractionRecord } from "@/lib/attractions"
import { formatTimeLabel, parseTimeToMinutes } from "@/lib/planner-types"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface PlannerPageProps {
  attractions: AttractionRecord[]
}

type TabValue = "itinerary" | "discover" | "saved" | "settings"

export function PlannerPage({ attractions }: PlannerPageProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("itinerary")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const {
    plannerState,
    plannerItems,
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
    plannerMode,
    plannerSummary,
    isPlannerLoading,
    isPlannerSyncing,
    isTripListLoading,
  } = useDayPlanner()

  const totalVisitDuration = plannerItems.reduce(
    (sum, item) => sum + item.visitDurationMinutes,
    0
  )
  const totalTravelDuration = plannerItems.reduce(
    (sum, item) => sum + item.travelMinutes,
    0
  )
  const totalDayDuration = totalVisitDuration + totalTravelDuration
  const recommendedAttractions = attractions
    .filter((attraction) => !isInPlanner(attraction.id))
    .slice(0, 8)
  const finishTime = formatTimeLabel(
    parseTimeToMinutes(plannerState.dayStartTime) + totalDayDuration
  )
  const startLocation = plannerState.startLocation.trim()
  const endLocation = plannerState.endLocation.trim()
  const isSignedIn = plannerMode === "account"

  const handleTabClick = (tab: TabValue) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  const handleSaveTrip = async (asNew = false) => {
    const tripId = await saveCurrentTrip(asNew)

    if (tripId) {
      setActiveTab("saved")
    }
  }

  const handleLoadTrip = async (tripId: string) => {
    const didLoad = await loadTrip(tripId)

    if (didLoad) {
      setActiveTab("itinerary")
      setIsMobileMenuOpen(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const renderNav = () => (
    <>
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link
          href="/"
          className="emil-button flex items-center gap-2 text-zinc-900 dark:text-zinc-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">LocalLens</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-4">
          <p className="px-3 pb-2 text-xs font-bold tracking-[0.2em] text-emerald-600 uppercase dark:text-emerald-400">
            Planner
          </p>
          <button
            onClick={() => handleTabClick("itinerary")}
            className={cn(
              "emil-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
              activeTab === "itinerary"
                ? "bg-zinc-900 text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            )}
          >
            <ListOrdered className="h-4 w-4" />
            Itinerary Schedule
          </button>
          <button
            onClick={() => handleTabClick("discover")}
            className={cn(
              "emil-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
              activeTab === "discover"
                ? "bg-zinc-900 text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            )}
          >
            <Map className="h-4 w-4" />
            Discover Stops
          </button>
          <button
            onClick={() => handleTabClick("saved")}
            className={cn(
              "emil-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
              activeTab === "saved"
                ? "bg-zinc-900 text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            )}
          >
            <History className="h-4 w-4" />
            Saved Trips
          </button>
          <button
            onClick={() => handleTabClick("settings")}
            className={cn(
              "emil-button flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
              activeTab === "settings"
                ? "bg-zinc-900 text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            )}
          >
            <Settings2 className="h-4 w-4" />
            Trip Settings
          </button>
        </nav>

        <div className="mt-8 px-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
            <p className="text-xs font-bold tracking-tight text-emerald-900 dark:text-emerald-50">
              Sync Status
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <RefreshCcw
                className={cn(
                  "h-3 w-3",
                  (isPlannerSyncing || isTripListLoading) && "animate-spin"
                )}
              />
              {isPlannerSyncing
                ? "Saving..."
                : isPlannerLoading || isTripListLoading
                  ? "Loading..."
                  : plannerSummary}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        {isSignedIn && (
          <button
            type="button"
            onClick={() => {
              void handleSignOut()
              setIsMobileMenuOpen(false)
            }}
            className="emil-button mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
        <Link
          href="/"
          className="emil-button mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
        <button
          type="button"
          onClick={() => {
            clearPlanner()
            setIsMobileMenuOpen(false)
          }}
          className="emil-button flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
        >
          <Trash2 className="h-4 w-4" />
          Clear Planner
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-zinc-50 selection:bg-emerald-500/30 dark:bg-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-zinc-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-950">
        {renderNav()}
      </aside>

      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md lg:hidden dark:border-zinc-800 dark:bg-zinc-950/80">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">LocalLens</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-72 flex-col bg-white p-0 dark:bg-zinc-950"
            >
              <SheetTitle className="sr-only">Planner Menu</SheetTitle>
              {renderNav()}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 pt-16 pb-20 lg:ml-72 lg:pt-0">
        <div className="mx-auto max-w-6xl p-4 sm:p-8">
          <div
            className="stagger-item mb-8"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
                  {plannerState.tripName || "Your Itinerary"}
                </h1>
                <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {plannerState.tripDate
                    ? new Date(plannerState.tripDate).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )
                    : "Plan your perfect day out."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {plannerItems.length > 0 && (
                  <>
                    <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                      <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {plannerItems.length}{" "}
                        <span className="font-normal text-zinc-500 dark:text-zinc-400">
                          stops
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                      <Clock3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {finishTime}{" "}
                        <span className="font-normal text-zinc-500 dark:text-zinc-400">
                          finish
                        </span>
                      </span>
                    </div>
                  </>
                )}
                {startLocation && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      Start:{" "}
                      <span className="font-normal text-zinc-500 dark:text-zinc-400">
                        {startLocation}
                      </span>
                    </span>
                  </div>
                )}
                {endLocation && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      End:{" "}
                      <span className="font-normal text-zinc-500 dark:text-zinc-400">
                        {endLocation}
                      </span>
                    </span>
                  </div>
                )}
                {isSignedIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        void handleSaveTrip(false)
                      }}
                      className="emil-button inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <Save className="h-4 w-4" />
                      {activeTripId ? "Save Changes" : "Save Trip"}
                    </button>
                    {activeTripId && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleSaveTrip(true)
                        }}
                        className="emil-button inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        <CirclePlus className="h-4 w-4" />
                        Save As New
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="emil-button inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In To Save
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="stagger-item" style={{ animationDelay: "150ms" }}>
            {activeTab === "itinerary" && (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900 dark:ring-zinc-800/60">
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <DayPlanner
                      items={plannerItems}
                      onReorder={reorderPlanner}
                      onRemove={(item) => removeFromPlanner(item.id)}
                      onClear={clearPlanner}
                      dayStartTime={plannerState.dayStartTime}
                      mode="detailed"
                      onUpdateItem={updatePlannerItem}
                    />
                  </div>
                </div>

                <div className="relative h-[400px] min-h-[400px] rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-zinc-200/60 lg:h-auto dark:bg-zinc-900 dark:ring-zinc-800/60">
                  <div className="h-full w-full overflow-hidden rounded-[1.5rem]">
                    <PlannerMap
                      items={plannerItems}
                      startLocation={startLocation}
                      endLocation={endLocation}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "discover" && (
              <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200/60 sm:p-8 dark:bg-zinc-900 dark:ring-zinc-800/60">
                <div className="mb-8 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.24em] text-emerald-600 uppercase dark:text-emerald-400">
                      Recommendations
                    </p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                      Add more to your route
                    </h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {recommendedAttractions.length > 0 ? (
                    recommendedAttractions.map((attraction) => (
                      <div
                        key={attraction.id}
                        className="emil-transition group flex flex-col overflow-hidden rounded-[1.5rem] bg-zinc-50 ring-1 ring-zinc-200/70 hover:shadow-md hover:ring-zinc-300 dark:bg-zinc-950 dark:ring-zinc-800/70 dark:hover:bg-zinc-900 dark:hover:ring-zinc-700"
                      >
                        <div className="relative h-40 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                          {attraction.images?.[0] ? (
                            <Image
                              src={attraction.images[0]}
                              alt={attraction.name}
                              fill
                              className="emil-transition object-cover group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-zinc-400">
                              <MapPin className="h-8 w-8" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between">
                            <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-white drop-shadow-md">
                              {attraction.name}
                            </h3>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                              {attraction.shortDescription ||
                                attraction.description}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                              {attraction.category && (
                                <span className="rounded-md bg-zinc-200/50 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  {attraction.category.name}
                                </span>
                              )}
                              {attraction.suggestedVisitDurationMinutes && (
                                <span className="rounded-md bg-zinc-200/50 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  ~{attraction.suggestedVisitDurationMinutes}m
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addToPlanner(attraction)}
                            className="emil-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                          >
                            <Plus className="h-4 w-4" />
                            Add to Itinerary
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-[2rem] border border-dashed border-zinc-300 bg-zinc-50/50 px-5 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
                      <p className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
                        Your planner is fully stocked!
                      </p>
                      <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
                        You&apos;ve added all available recommendations. Enjoy
                        your trip!
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
            {activeTab === "saved" && (
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200/60 sm:p-8 dark:bg-zinc-900 dark:ring-zinc-800/60">
                  <p className="text-xs font-bold tracking-[0.24em] text-emerald-600 uppercase dark:text-emerald-400">
                    Trip Library
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                    Save and revisit trips
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    Keep your itinerary in an account, reopen old plans, and
                    keep separate day trips instead of overwriting one planner.
                  </p>

                  {!isSignedIn ? (
                    <div className="mt-8 rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50/80 p-5 dark:border-zinc-700 dark:bg-zinc-950/50">
                      <p className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                        Sign in to unlock trip history
                      </p>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        Your current planner already stays in this browser. With
                        an account, you can save full trips, come back later,
                        and browse past travel plans.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href="/login"
                          className="emil-button inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="emil-button inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        >
                          <UserPlus className="h-4 w-4" />
                          Create Account
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 space-y-4">
                      <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                              {activeTripId
                                ? "Current Saved Trip"
                                : "Current Draft"}
                            </p>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                              {activeTripId
                                ? "This itinerary is linked to your account and updates can be saved back to that trip."
                                : "This planner is still a draft. Save it to keep it in your trip history."}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                void handleSaveTrip(false)
                              }}
                              className="emil-button inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                              <Save className="h-4 w-4" />
                              {activeTripId ? "Save Changes" : "Save Trip"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                startNewTrip()
                                setActiveTab("itinerary")
                              }}
                              className="emil-button inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                            >
                              <CirclePlus className="h-4 w-4" />
                              Start New Draft
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                            Account Trip History
                          </p>
                          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                            {trips.length} saved
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                          Open any saved itinerary to continue planning or
                          revisit an older trip.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200/60 sm:p-8 dark:bg-zinc-900 dark:ring-zinc-800/60">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold tracking-[0.24em] text-emerald-600 uppercase dark:text-emerald-400">
                        Saved Trips
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                        Your trip history
                      </h3>
                    </div>
                  </div>

                  {!isSignedIn ? (
                    <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
                      <FolderOpen className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-500" />
                      <p className="mt-4 text-lg font-bold text-zinc-950 dark:text-zinc-50">
                        No account trip history yet
                      </p>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        Sign in and save your current itinerary to start
                        building a reusable trip library.
                      </p>
                    </div>
                  ) : trips.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
                      <History className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-500" />
                      <p className="mt-4 text-lg font-bold text-zinc-950 dark:text-zinc-50">
                        No saved trips yet
                      </p>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        Save the planner you&apos;re working on and it will
                        appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trips.map((trip) => {
                        const isCurrentTrip = trip.id === activeTripId

                        return (
                          <div
                            key={trip.id}
                            className={cn(
                              "rounded-[1.5rem] border p-5 transition-colors",
                              isCurrentTrip
                                ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-500/10"
                                : "border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50"
                            )}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                                    {trip.name}
                                  </h4>
                                  {isCurrentTrip && (
                                    <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                                  {trip.tripDate
                                    ? new Date(
                                        trip.tripDate
                                      ).toLocaleDateString()
                                    : "No date set"}{" "}
                                  • {trip.stopCount} stop
                                  {trip.stopCount === 1 ? "" : "s"}
                                </p>
                                <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                  Updated{" "}
                                  {new Date(
                                    trip.updatedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleLoadTrip(trip.id)
                                }}
                                className="emil-button inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                              >
                                <FolderOpen className="h-4 w-4" />
                                {isCurrentTrip ? "Open Current" : "Load Trip"}
                              </button>
                            </div>

                            {(trip.startLocation || trip.endLocation) && (
                              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                                {trip.startLocation && (
                                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                    Start: {trip.startLocation}
                                  </span>
                                )}
                                {trip.endLocation && (
                                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                    End: {trip.endLocation}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200/60 sm:p-8 dark:bg-zinc-900 dark:ring-zinc-800/60">
                  <h2 className="mb-6 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                    Trip Metadata
                  </h2>
                  <div className="space-y-6">
                    <label className="block space-y-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Trip Name
                      <input
                        type="text"
                        value={plannerState.tripName}
                        onChange={(event) =>
                          updatePlannerMeta({ tripName: event.target.value })
                        }
                        placeholder="e.g. Weekend getaway to Ella"
                        className="emil-transition h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 text-base text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                      />
                    </label>

                    <label className="block space-y-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Planned Date
                      <input
                        type="date"
                        value={plannerState.tripDate}
                        onChange={(event) =>
                          updatePlannerMeta({ tripDate: event.target.value })
                        }
                        className="emil-transition h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 text-base text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                      />
                    </label>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <label className="block space-y-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Start Place
                        <input
                          type="text"
                          value={plannerState.startLocation}
                          onChange={(event) =>
                            updatePlannerMeta({
                              startLocation: event.target.value,
                            })
                          }
                          placeholder="e.g. Mountain Heavens hotel"
                          className="emil-transition h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 text-base text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                        />
                      </label>

                      <label className="block space-y-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        End Place
                        <input
                          type="text"
                          value={plannerState.endLocation}
                          onChange={(event) =>
                            updatePlannerMeta({
                              endLocation: event.target.value,
                            })
                          }
                          placeholder="e.g. Back to Ella town"
                          className="emil-transition h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 text-base text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                        />
                      </label>
                    </div>

                    <label className="block space-y-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Day Starts At
                      <input
                        type="time"
                        value={plannerState.dayStartTime}
                        onChange={(event) =>
                          updatePlannerMeta({
                            dayStartTime: event.target.value,
                          })
                        }
                        className="emil-transition h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 text-base text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                      />
                    </label>
                  </div>
                </section>

                <section className="h-fit rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200/60 sm:p-8 dark:bg-zinc-900 dark:ring-zinc-800/60">
                  <h2 className="mb-6 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                    Field Checklist
                  </h2>
                  <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                      <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-zinc-900">
                        <CarFront className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="pt-1 leading-relaxed">
                        Set the transport mode and expected travel time after
                        each stop to ensure your total day length stays
                        realistic.
                      </p>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                      <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-zinc-900">
                        <Ticket className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="pt-1 leading-relaxed">
                        Use notes for entry fees, snacks, viewpoints, footwear,
                        or sunset timing. Don&apos;t rely on memory.
                      </p>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                      <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-zinc-900">
                        <Compass className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="pt-1 leading-relaxed">
                        Keep high-energy hikes earlier in the day and use easier
                        viewpoints as your late-day buffer.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
