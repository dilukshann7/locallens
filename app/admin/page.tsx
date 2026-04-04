import { db } from "@/lib/db"
import { attraction, category, itinerary, user } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import {
  MapPin,
  Users,
  CalendarDays,
  TrendingUp,
  Plus,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const [attractionsCount, categoriesCount, itinerariesCount, usersCount] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(attraction)
        .where(eq(attraction.isActive, true)),
      db.select({ count: sql<number>`count(*)` }).from(category),
      db.select({ count: sql<number>`count(*)` }).from(itinerary),
      db.select({ count: sql<number>`count(*)` }).from(user),
    ])

  const recentAttractions = await db
    .select()
    .from(attraction)
    .orderBy(attraction.createdAt)
    .limit(5)

  const stats = [
    {
      label: "Total Attractions",
      value: attractionsCount[0]?.count || 0,
      icon: MapPin,
    },
    {
      label: "Categories",
      value: categoriesCount[0]?.count || 0,
      icon: TrendingUp,
    },
    {
      label: "Itineraries",
      value: itinerariesCount[0]?.count || 0,
      icon: CalendarDays,
    },
    {
      label: "Total Users",
      value: usersCount[0]?.count || 0,
      icon: Users,
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your LocalLens ecosystem and metrics.
          </p>
        </div>
        <Link href="/admin/attractions/new" className="group">
          <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Plus className="h-4 w-4" />
            <span>Add Attraction</span>
          </button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Recent Attractions
          </h2>
          <Link
            href="/admin/attractions"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {recentAttractions.map((attr) => (
              <Link
                key={attr.id}
                href={`/admin/attractions/${attr.id}`}
                className="group flex items-center justify-between p-4 transition-colors hover:bg-zinc-50 sm:p-6 dark:hover:bg-zinc-900/50"
              >
                <div className="space-y-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {attr.name}
                  </p>
                  <p className="line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {attr.address || "No address provided"}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 transition-all group-hover:border-zinc-300 group-hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:group-hover:border-zinc-600 dark:group-hover:text-zinc-50">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
