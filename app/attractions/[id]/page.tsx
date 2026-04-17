import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CloudRain,
  MapPin,
  ShieldAlert,
} from "lucide-react"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { getActiveAttractionById } from "@/lib/attractions"
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
    getActiveAttractionById(id),
    getReviewsByAttractionId(id),
    getCurrentUserRecord(),
  ])

  if (!attraction) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eef3e4_0%,#f8f4ec_42%,#fcfcfa_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950"
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

        <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 shadow-[0_28px_90px_rgba(24,24,24,0.08)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[1.25fr_0.9fr]">
            <div className="relative min-h-88 bg-zinc-100">
              {attraction.images?.[0] ? (
                <Image
                  src={attraction.images[0]}
                  alt={attraction.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
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
                <h1 className="mt-3 max-w-2xl font-serif text-4xl tracking-tight sm:text-5xl">
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
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/80 p-4">
                  <p className="text-xs font-semibold tracking-[0.22em] text-zinc-500 uppercase">
                    Distance
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-zinc-950">
                    {attraction.distanceFromBeragalaKm
                      ? `${attraction.distanceFromBeragalaKm} km`
                      : "Local pick"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/80 p-4">
                  <p className="text-xs font-semibold tracking-[0.22em] text-zinc-500 uppercase">
                    Suggested Time
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-zinc-950">
                    {attraction.suggestedVisitDurationMinutes
                      ? `${attraction.suggestedVisitDurationMinutes} min`
                      : "Flexible"}
                  </p>
                </div>
              </div>

              {attraction.address && (
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-white/75 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-zinc-950">
                        Where to go
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        {attraction.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {attraction.bestTimeToVisit && (
                <div className="rounded-[1.4rem] border border-zinc-200/80 bg-white/75 p-4">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-5 w-5 text-sky-600" />
                    <div>
                      <p className="text-sm font-medium text-zinc-950">
                        Best time to visit
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        {attraction.bestTimeToVisit}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_24px_80px_rgba(24,24,24,0.08)] backdrop-blur-xl sm:p-8">
            <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase">
              Story
            </p>
            <div className="prose prose-zinc mt-4 max-w-none">
              <p className="text-base leading-8 text-zinc-700">
                {attraction.description}
              </p>
            </div>
          </article>

          <aside className="space-y-6">
            {(attraction.safetyNote || attraction.weatherNote) && (
              <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_24px_80px_rgba(24,24,24,0.08)] backdrop-blur-xl">
                <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase">
                  Field Notes
                </p>
                <div className="mt-5 space-y-4">
                  {attraction.safetyNote && (
                    <div className="rounded-[1.4rem] border border-rose-200/80 bg-rose-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-600" />
                        <div>
                          <p className="text-sm font-medium text-rose-900">
                            Safety note
                          </p>
                          <p className="mt-1 text-sm leading-6 text-rose-800/80">
                            {attraction.safetyNote}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {attraction.weatherNote && (
                    <div className="rounded-[1.4rem] border border-sky-200/80 bg-sky-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <CloudRain className="mt-0.5 h-5 w-5 text-sky-600" />
                        <div>
                          <p className="text-sm font-medium text-sky-900">
                            Weather note
                          </p>
                          <p className="mt-1 text-sm leading-6 text-sky-800/80">
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
              <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_24px_80px_rgba(24,24,24,0.08)] backdrop-blur-xl">
                <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase">
                  Gallery
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {attraction.images.slice(1).map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-zinc-100"
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
