import { db } from "@/lib/db"
import { attraction, category } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { AttractionForm } from "@/components/admin/attraction-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getAttraction(id: string) {
  return db
    .select()
    .from(attraction)
    .where(eq(attraction.id, id))
    .then((rows) => rows[0])
}

async function getCategories() {
  return db.select().from(category).orderBy(category.name)
}

export default async function EditAttractionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [attractionData, categories] = await Promise.all([
    getAttraction(id),
    getCategories(),
  ])

  if (!attractionData) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/attractions"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit Attraction
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Update the details for {attractionData.name}.
          </p>
        </div>
      </div>

      <AttractionForm
        attraction={{
          id: attractionData.id,
          name: attractionData.name,
          description: attractionData.description,
          shortDescription: attractionData.shortDescription ?? undefined,
          categoryId: attractionData.categoryId ?? undefined,
          latitude: attractionData.latitude ?? "",
          longitude: attractionData.longitude ?? "",
          address: attractionData.address ?? undefined,
          distanceFromBeragalaKm:
            attractionData.distanceFromBeragalaKm ?? undefined,
          images: attractionData.images ?? [],
          suggestedVisitDurationMinutes:
            attractionData.suggestedVisitDurationMinutes ?? undefined,
          bestTimeToVisit: attractionData.bestTimeToVisit ?? undefined,
          weatherNote: attractionData.weatherNote ?? undefined,
          safetyNote: attractionData.safetyNote ?? undefined,
          isPopular: attractionData.isPopular,
        }}
        categories={categories}
      />
    </div>
  )
}
