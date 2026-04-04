import { db } from "@/lib/db"
import { attraction, category } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { MapPin, Plus, Edit, Eye, EyeOff, Search, Sparkles } from "lucide-react"
import { AdminDeleteAttractionButton } from "@/components/admin/delete-attraction-button"

async function toggleAttractionVisibility(id: string, currentState: boolean) {
  "use server"
  await db
    .update(attraction)
    .set({ isActive: !currentState })
    .where(eq(attraction.id, id))

  revalidatePath("/admin/attractions")
}

export default async function AttractionsPage() {
  const attractions = await db
    .select({
      id: attraction.id,
      name: attraction.name,
      isActive: attraction.isActive,
      isPopular: attraction.isPopular,
      distanceFromBeragalaKm: attraction.distanceFromBeragalaKm,
      categoryName: category.name,
      categorySlug: category.slug,
    })
    .from(attraction)
    .leftJoin(category, eq(attraction.categoryId, category.id))
    .orderBy(desc(attraction.createdAt))

  const activeCount = attractions.filter((a) => a.isActive).length
  const hiddenCount = attractions.filter((a) => !a.isActive).length

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            Attractions
          </h1>
          <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{activeCount} Active</span>
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>{hiddenCount} Hidden</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search places..."
              className="h-10 w-full rounded-full border border-zinc-200 bg-white pr-4 pl-9 text-sm transition-all outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 sm:w-64 dark:border-zinc-800 dark:bg-zinc-950/50 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
            />
          </div>
          <Link href="/admin/attractions/new" className="shrink-0">
            <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {attractions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                <MapPin className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                No attractions added yet
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Get started by creating your first destination.
              </p>
            </div>
          ) : (
            attractions.map((attr) => (
              <div
                key={attr.id}
                className={`group flex items-center justify-between p-4 transition-colors hover:bg-zinc-50 sm:px-6 dark:hover:bg-zinc-900/50 ${
                  !attr.isActive ? "opacity-60 grayscale-50" : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-600 sm:flex dark:bg-zinc-800 dark:text-zinc-400">
                    {attr.categoryName?.charAt(0) || "U"}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-medium text-zinc-900 dark:text-zinc-50">
                        {attr.name}
                      </h3>
                      {!attr.isActive && (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          Hidden
                        </span>
                      )}
                      {attr.isPopular && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                          <Sparkles className="h-3 w-3" />
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {attr.categoryName && (
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">
                          {attr.categoryName}
                        </span>
                      )}
                      {attr.categoryName && attr.distanceFromBeragalaKm && (
                        <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block dark:bg-zinc-700" />
                      )}
                      {attr.distanceFromBeragalaKm && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {attr.distanceFromBeragalaKm} km
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-4">
                  <form
                    action={async () => {
                      "use server"
                      await toggleAttractionVisibility(attr.id, !!attr.isActive)
                    }}
                  >
                    <button
                      type="submit"
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        attr.isActive
                          ? "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                      }`}
                      title={
                        attr.isActive ? "Hide attraction" : "Show attraction"
                      }
                    >
                      {attr.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                  <Link href={`/admin/attractions/${attr.id}`}>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                  <AdminDeleteAttractionButton attractionId={attr.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
