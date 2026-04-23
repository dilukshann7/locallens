import { TouristExplorer } from "@/components/explorer/tourist-explorer"
import { getActiveAttractions, getCategories } from "@/lib/attractions"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"
export const metadata = createPageMetadata({
  title: "Explore Attractions",
  description:
    "Browse waterfalls, viewpoints, tea country stops, and local experiences around Beragala and Ella.",
})

export default async function ExplorePage() {
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
