import { PlannerPage } from "@/components/planner/planner-page"
import { getActiveAttractions } from "@/lib/attractions"

export const dynamic = "force-dynamic"

export default async function PlannerRoute() {
  const attractions = await getActiveAttractions()

  return <PlannerPage attractions={attractions} />
}
