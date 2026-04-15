import { TouristExplorer } from "@/components/explorer/tourist-explorer"
import { getActiveAttractions, getCategories } from "@/lib/attractions"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [attractions, categories] = await Promise.all([
    getActiveAttractions(),
    getCategories(),
  ])

  return (
    <main className="min-h-screen">
      <TouristExplorer attractions={attractions} categories={categories} />
    </main>
  )
}
