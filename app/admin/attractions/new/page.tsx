import { db } from "@/lib/db"
import { category } from "@/lib/db/schema"
import { AttractionForm } from "@/components/admin/attraction-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getCategories() {
  return db.select().from(category).orderBy(category.name)
}

export default async function NewAttractionPage() {
  const categories = await getCategories()

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
            Add New Attraction
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create a new destination for tourists to discover.
          </p>
        </div>
      </div>

      <AttractionForm categories={categories} />
    </div>
  )
}
