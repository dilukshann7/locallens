import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CloudRain,
  MapPin,
  Route,
  ShieldAlert,
  Users,
  Accessibility,
} from "lucide-react"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { getActiveAttractionBySlugOrId } from "@/lib/attractions"
import { getCurrentUserRecord } from "@/lib/auth/session"
import { getReviewsByAttractionId } from "@/lib/reviews"

export const dynamic = "force-dynamic"

export default async function AttractionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [attraction, reviews, currentUser] = await Promise.all([
    getActiveAttractionBySlugOrId(id),
    getReviewsByAttractionId(id),
    getCurrentUserRecord(),
  ])

  if (!attraction) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 backdrop-blur-xl transition-colors hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explorer
            </Link>
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.01] dark:bg-zinc-50 dark:text-zinc-950"
            >
              <CalendarDays className="h-4 w-4" />
              Open Planner
            </Link>
          </div>
          <ThemeToggle />
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white shadow-sm backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950">
          <div className="grid lg:grid-cols-[1.25fr_0.9fr]">
            <div className="relative min-h-88 bg-zinc-100 dark:bg-zinc-900">
              {attraction.primaryImageUrl ? (
                <Image
                  src={attraction.primaryImageUrl}
                  alt={attraction.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-700">
                  <MapPin className="h-10 w-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                {attraction.category && (
                  <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase backdrop-blur-md">
                    {attraction.category.name}
                  </span>
                )}
                <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  {attraction.name}
                </h1>
                {attraction.shortDescription && (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                    {attraction.shortDescription}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <p className="text-xs font-semibold tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-400">
                    Distance
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                    {attraction.distanceFromBeragalaKm
                      ? `${attraction.distanceFromBeragalaKm} km`
                      : "Local pick"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <p className="text-xs font-semibold tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-400">
                    Suggested Time
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                    {attraction.suggestedVisitDurationMinutes
                      ? `${attraction.suggestedVisitDurationMinutes} min`
                      : "Flexible"}
                  </p>
                </div>
              </div>

              {attraction.address && (
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                        Where to go
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        {attraction.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {attraction.bestTimeToVisit && (
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-5 w-5 text-sky-600 dark:text-sky-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                        Best time to visit
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        {attraction.bestTimeToVisit}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {attraction.openingHours && (
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                        Opening hours
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        {attraction.openingHours}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-zinc-200/70 bg-white p-6 shadow-sm backdrop-blur-xl sm:p-8 dark:border-zinc-800/70 dark:bg-zinc-950">
            <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase dark:text-zinc-400">
              Story
            </p>
            <div className="prose prose-zinc mt-4 max-w-none">
              <p className="text-base leading-8 text-zinc-700 dark:text-zinc-300">
                {attraction.description}
              </p>
            </div>
          </article>

          <aside className="space-y-6">
            {(attraction.travelTips ||
              attraction.transportInfo ||
              attraction.accessibilityInfo ||
              attraction.crowdLevel) && (
              <section className="rounded-[2rem] border border-zinc-200/70 bg-white p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950">
                <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase dark:text-zinc-400">
                  Local Planning Notes
                </p>
                <div className="mt-5 space-y-4">
                  {attraction.travelTips && (
                    <div className="rounded-[1.4rem] border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                        Travel tips
                      </p>
                      <p className="mt-1 text-sm leading-6 text-emerald-800/80 dark:text-emerald-200/80">
                        {attraction.travelTips}
                      </p>
                    </div>
                  )}

                  {attraction.transportInfo && (
                    <div className="flex gap-3 rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                      <Route className="mt-0.5 h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                          Transport
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          {attraction.transportInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {attraction.accessibilityInfo && (
                    <div className="flex gap-3 rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                      <Accessibility className="mt-0.5 h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                          Accessibility
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          {attraction.accessibilityInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {attraction.crowdLevel && (
                    <div className="flex gap-3 rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                      <Users className="mt-0.5 h-5 w-5 text-zinc-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                          Crowd level
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          {attraction.crowdLevel}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {(attraction.disclaimer ||
              attraction.safetyNote ||
              attraction.weatherNote) && (
              <section className="rounded-[2rem] border border-zinc-200/70 bg-white p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950">
                <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase dark:text-zinc-400">
                  Field Notes
                </p>
                <div className="mt-5 space-y-4">
                  {(attraction.disclaimer || attraction.safetyNote) && (
                    <div className="rounded-[1.4rem] border border-rose-200/80 bg-rose-50/80 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-600 dark:text-rose-400" />
                        <div>
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-200">
                            Safety disclaimer
                          </p>
                          <p className="mt-1 text-sm leading-6 text-rose-800/80 dark:text-rose-200/80">
                            {attraction.disclaimer ?? attraction.safetyNote}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {attraction.weatherNote && (
                    <div className="rounded-[1.4rem] border border-sky-200/80 bg-sky-50/80 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                      <div className="flex items-start gap-3">
                        <CloudRain className="mt-0.5 h-5 w-5 text-sky-600 dark:text-sky-400" />
                        <div>
                          <p className="text-sm font-medium text-sky-900 dark:text-sky-200">
                            Weather note
                          </p>
                          <p className="mt-1 text-sm leading-6 text-sky-800/80 dark:text-sky-200/80">
                            {attraction.weatherNote}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {attraction.images && attraction.images.length > 1 && (
              <section className="rounded-[2rem] border border-zinc-200/70 bg-white p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950">
                <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase dark:text-zinc-400">
                  Gallery
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {attraction.images.slice(1).map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-zinc-100 dark:bg-zinc-900"
                    >
                      <Image
                        src={imageUrl}
                        alt={`${attraction.name} gallery image ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </section>

        <ReviewsSection
          attractionId={attraction.id}
          reviews={reviews}
          averageRating={attraction.averageRating}
          reviewCount={attraction.reviewCount}
          currentUserName={currentUser?.name}
        />
      </div>
    </main>
  )
}
