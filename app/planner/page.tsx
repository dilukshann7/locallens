import { PlannerPage } from "@/components/planner/planner-page"
import { getActiveAttractions } from "@/lib/attractions"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"
export const metadata = createPageMetadata({
  title: "Day Trip Planner",
  description:
    "Build a custom Beragala and Ella day itinerary with timing, attraction details, and practical trip planning notes.",
})

export default async function PlannerRoute() {
  const attractions = await getActiveAttractions()

  return <PlannerPage attractions={attractions} />
}
