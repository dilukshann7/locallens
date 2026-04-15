import { db } from "@/lib/db"
import { category, attraction } from "@/lib/db/schema"

const categories = [
  {
    id: "nature",
    name: "Nature",
    slug: "nature",
    description: "Natural wonders and scenic landscapes",
    icon: "leaf",
  },
  {
    id: "heritage",
    name: "Heritage",
    slug: "heritage",
    description: "Historical and cultural landmarks",
    icon: "building",
  },
  {
    id: "sightseeing",
    name: "Sightseeing",
    slug: "sightseeing",
    description: "Scenic viewpoints and panoramic vistas",
    icon: "eye",
  },
  {
    id: "industrial",
    name: "Industrial",
    slug: "industrial",
    description: "Tea factories and industrial heritage",
    icon: "factory",
  },
  {
    id: "adventure",
    name: "Adventure",
    slug: "adventure",
    description: "Hiking trails and adventure activities",
    icon: "mountain",
  },
]

const attractions = [
  {
    id: "beragala-viewpoint",
    name: "Beragala Viewpoint",
    description:
      "A stunning panoramic viewpoint offering breathtaking views of the Ella gap and surrounding highlands. The sunrise here is particularly magical, with mist rolling through the valleys below. Popular among photographers and nature enthusiasts.",
    shortDescription: "Panoramic sunrise views over the Ella gap",
    categoryId: "sightseeing",
    latitude: "6.7989",
    longitude: "80.8234",
    address: "Viharagala, Beragala",
    distanceFromBeragalaKm: "3",
    images: [],
    suggestedVisitDurationMinutes: 60,
    bestTimeToVisit: "Early morning for sunrise",
    isPopular: true,
  },
  {
    id: "adisham-bungalow",
    name: "Adisham Bungalow",
    description:
      "A beautifully preserved British colonial-era tea planter's bungalow turned into a heritage hotel. The English country-style architecture, manicured gardens, and serene atmosphere make it a perfect glimpse into Sri Lanka's colonial past.",
    shortDescription: "Colonial tea planter's bungalow from 1890s",
    categoryId: "heritage",
    latitude: "6.7833",
    longitude: "80.7500",
    address: "Adisham, Haputale",
    distanceFromBeragalaKm: "10",
    images: [],
    suggestedVisitDurationMinutes: 90,
    bestTimeToVisit: "Morning or afternoon tea",
    isPopular: true,
  },
  {
    id: "bambarakanda-falls",
    name: "Bambarakanda Falls",
    description:
      "Sri Lanka's highest waterfall at 263 meters. The falls cascade down from the Bambarakanda Estate, creating a mesmerizing sight especially during the monsoon season. A challenging hike leads to the base of the falls.",
    shortDescription: "Sri Lanka's tallest waterfall at 263m",
    categoryId: "nature",
    latitude: "6.7333",
    longitude: "80.6167",
    address: "Bambarakanda, Kalupahana",
    distanceFromBeragalaKm: "16",
    images: [],
    suggestedVisitDurationMinutes: 120,
    bestTimeToVisit: "November to April",
    weatherNote: "Slippery paths during rainy season",
    isPopular: true,
  },
  {
    id: "diyaluma-falls",
    name: "Diyaluma Falls",
    description:
      "The second highest waterfall in Sri Lanka at 220 meters. What makes Diyaluma unique is the natural pool at the top where visitors can swim. The falls create multiple tiers before cascading down, creating a spectacular natural wonder.",
    shortDescription: "220m waterfall with natural swimming pool",
    categoryId: "nature",
    latitude: "6.7167",
    longitude: "80.7167",
    address: "Diyaluma, Koslanda",
    distanceFromBeragalaKm: "25",
    images: [],
    suggestedVisitDurationMinutes: 150,
    bestTimeToVisit: "After monsoon season",
    safetyNote: "Strong currents in the pool - swim with caution",
    isPopular: true,
  },
  {
    id: "lintons-seat",
    name: "Lipton's Seat",
    description:
      "Named after Sir Thomas Lipton, this viewpoint offers spectacular 360-degree views of the tea-covered hills, valleys, and the distant plains. It's where Lipton supposedly came to survey his tea estates. The sunrise view is extraordinary.",
    shortDescription: "Iconic tea estate viewpoint with panoramic vistas",
    categoryId: "sightseeing",
    latitude: "6.7833",
    longitude: "80.8167",
    address: "Dambatenne, Haputale",
    distanceFromBeragalaKm: "19",
    images: [],
    suggestedVisitDurationMinutes: 90,
    bestTimeToVisit: "Early morning for sunrise",
    isPopular: true,
  },
  {
    id: "dambatenne-tea-factory",
    name: "Dambatenne Tea Factory",
    description:
      "One of the oldest tea factories in Sri Lanka, established in 1890. Visitors can tour the factory to see the traditional tea processing methods and sample some of the finest Uva tea. The architecture reflects colonial industrial design.",
    shortDescription: "Historic tea factory since 1890",
    categoryId: "industrial",
    latitude: "6.7833",
    longitude: "80.8167",
    address: "Dambatenne, Haputale",
    distanceFromBeragalaKm: "15",
    images: [],
    suggestedVisitDurationMinutes: 90,
    bestTimeToVisit: "Morning tours recommended",
    isPopular: true,
  },
  {
    id: "soragune-devalaya",
    name: "Soragune Devalaya",
    description:
      "An ancient Hindu temple dedicated to Lord Murugan, perched on a rocky outcrop. The temple dates back to the 16th century and offers stunning views of the surrounding mountains. The annual Vel festival draws thousands of devotees.",
    shortDescription: "16th century Hindu temple on rock fortress",
    categoryId: "heritage",
    latitude: "6.8500",
    longitude: "80.8000",
    address: "Soragune, Haldummulla",
    distanceFromBeragalaKm: "12",
    images: [],
    suggestedVisitDurationMinutes: 60,
    bestTimeToVisit: "Any time, but April/May for festival",
    isPopular: false,
  },
  {
    id: "idalgashinna-station",
    name: "Idalgashinna Station",
    description:
      "A charming colonial-era railway station nestled in the mountains. The station, with its red-brick buildings and manicured gardens, offers a glimpse into Sri Lanka's railway heritage. It's a popular spot for train photography.",
    shortDescription: "Colonial railway station in the mist",
    categoryId: "sightseeing",
    latitude: "6.7667",
    longitude: "80.7500",
    address: "Idalgashinna, Haldummulla",
    distanceFromBeragalaKm: "16",
    images: [],
    suggestedVisitDurationMinutes: 45,
    bestTimeToVisit: "Morning for misty views",
    isPopular: false,
  },
  {
    id: "wangedigala",
    name: "Wangedigala",
    description:
      "A hidden gem for adventure seekers, Wangedigala is a mountain peak offering challenging hiking trails and breathtaking views from the summit. The area is known for its unique flora and fauna, including several endemic species.",
    shortDescription: "Adventure peak with endemic biodiversity",
    categoryId: "adventure",
    latitude: "6.8167",
    longitude: "80.7667",
    address: "Wangedigala, Haputale",
    distanceFromBeragalaKm: "13",
    images: [],
    suggestedVisitDurationMinutes: 240,
    bestTimeToVisit: "Early morning start",
    safetyNote: "Recommended for experienced hikers only",
    isPopular: false,
  },
  {
    id: "ravana-falls",
    name: "Ravana Falls",
    description:
      "Named after the legendary King Ravana from the Ramayana, this waterfall is one of the widest in Sri Lanka. The falls cascade from about 25 meters into a large natural pool. According to local legend, it is where Sita was held captive.",
    shortDescription: "Legendary 25m cascade from Ramayana",
    categoryId: "nature",
    latitude: "6.8833",
    longitude: "80.9667",
    address: "Ella",
    distanceFromBeragalaKm: "25",
    images: [],
    suggestedVisitDurationMinutes: 60,
    bestTimeToVisit: "Year-round, best after rain",
    isPopular: true,
  },
]

async function seed() {
  console.log("Seeding database...")

  for (const cat of categories) {
    await db
      .insert(category)
      .values(cat)
      .onConflictDoUpdate({
        target: category.id,
        set: { ...cat },
      })
      .catch((e) => {
        console.error("Error upserting:", e)
        throw e
      })
    console.log(`Upserted category: ${cat.name}`)
  }

  for (const attr of attractions) {
    await db
      .insert(attraction)
      .values(attr)
      .onConflictDoUpdate({
        target: attraction.id,
        set: { ...attr },
      })
      .catch((e) => {
        console.error("Error upserting:", e)
        throw e
      })
    console.log(`Upserted attraction: ${attr.name}`)
  }

  console.log("Seeding complete!")
}

seed().catch((e) => {
  console.error("Seed error:", e)
  process.exit(1)
})
