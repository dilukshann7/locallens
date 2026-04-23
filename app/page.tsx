import { HomePage } from "@/components/home/homepage"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Beragala And Ella Travel Guide",
  description:
    "Plan scenic day trips, discover local attractions, and explore practical travel tips around Beragala and Ella with LocalLens.",
})

export default function HomeRoute() {
  return <HomePage />
}
