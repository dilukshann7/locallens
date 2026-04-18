import "dotenv/config"
import { db } from "@/lib/db"
import { attraction, attractionImage, category } from "@/lib/db/schema"

const categories = [
  {
    id: "nature",
    name: "Nature",
    slug: "nature",
    description: "Waterfalls, forest edges, valleys, and mountain landscapes.",
    icon: "leaf",
  },
  {
    id: "heritage",
    name: "Heritage",
    slug: "heritage",
    description: "Temples, colonial architecture, and cultural landmarks.",
    icon: "building",
  },
  {
    id: "sightseeing",
    name: "Sightseeing",
    slug: "sightseeing",
    description: "Viewpoints, railway stops, and scenic day-trip pauses.",
    icon: "eye",
  },
  {
    id: "industrial",
    name: "Industrial",
    slug: "industrial",
    description: "Tea factories and working hill-country production sites.",
    icon: "factory",
  },
  {
    id: "adventure",
    name: "Adventure",
    slug: "adventure",
    description: "Hikes, ridge walks, and high-energy outdoor stops.",
    icon: "mountain",
  },
]

const safetyDisclaimer =
  "Travel times, road conditions, and weather in the Beragala and Ella region can change quickly. Verify local conditions before travel."

const attractions = [
  {
    id: "beragala-viewpoint",
    slug: "beragala-viewpoint",
    name: "Beragala Viewpoint",
    description:
      "A roadside highland viewpoint looking across the southern valleys below Beragala. It is an easy first stop for sunrise, short photo breaks, and a calm overview of the route toward Haputale and Ella.",
    shortDescription: "Panoramic valley views close to Beragala.",
    categoryId: "sightseeing",
    latitude: "6.75903680",
    longitude: "80.9462397",
    address: "Beragala, Haputale Road",
    distanceFromBeragalaKm: "3",
    openingHours: "Open daily, best visited from dawn to late afternoon.",
    travelTips:
      "Arrive before sunrise for clear layers of mist, and keep a light jacket handy.",
    transportInfo:
      "Reachable by car, tuk-tuk, or bus stops along the Haputale road.",
    accessibilityInfo:
      "Roadside viewing area with uneven shoulders; suitable for short stops, not for wheelchairs after rain.",
    crowdLevel: "Quiet on weekdays, busier around sunrise on weekends.",
    suggestedVisitDurationMinutes: 45,
    bestTimeToVisit: "Sunrise to 8:00 AM",
    weatherNote: "Morning mist can hide the view, but often clears quickly.",
    safetyNote: "Stay clear of road edges and passing traffic.",
    disclaimer: safetyDisclaimer,
    isPopular: true,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Beragala%20Viewpoint.jpg",
  },
  {
    id: "adisham-bungalow",
    slug: "adisham-bungalow",
    name: "Adisham Bungalow",
    description:
      "A Tudor-style country house built during the tea planter era and now cared for by Benedictine monks. Visitors come for the stone architecture, gardens, chapel, and cool hill-country atmosphere.",
    shortDescription: "Colonial-era bungalow and garden retreat.",
    categoryId: "heritage",
    latitude: "6.772305",
    longitude: "80.928526",
    address: "St. Benedict's Monastery, Adisham Road, Haputale",
    distanceFromBeragalaKm: "10",
    openingHours: "Usually open on weekends and public holidays; verify ahead.",
    travelTips:
      "Carry cash for entry, keep voices low, and check opening days before leaving Beragala.",
    transportInfo:
      "Best reached by tuk-tuk or car from Haputale; road is narrow near the estate.",
    accessibilityInfo:
      "Garden paths include slopes and steps; limited wheelchair access.",
    crowdLevel: "Moderate on public holidays, calmer in the morning.",
    suggestedVisitDurationMinutes: 90,
    bestTimeToVisit: "Morning or early afternoon",
    weatherNote: "Light drizzle is common in the surrounding pine area.",
    safetyNote: "Respect restricted monastery areas and posted signs.",
    disclaimer: safetyDisclaimer,
    isPopular: true,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Adisham%20Bungalow.jpg",
  },
  {
    id: "bambarakanda-falls",
    slug: "bambarakanda-falls",
    name: "Bambarakanda Falls",
    description:
      "Sri Lanka's tallest waterfall (263 m) drops from the forested ridge above Kalupahana. The route combines mountain road views, short walks, and a dramatic cascade that changes character with the season.",
    shortDescription: "Sri Lanka's tallest waterfall near Kalupahana.",
    categoryId: "nature",
    latitude: "6.7733517",
    longitude: "80.8286389",
    address: "Kalupahana, off Colombo-Badulla Road",
    distanceFromBeragalaKm: "16",
    openingHours: "Open daily during daylight hours.",
    travelTips:
      "Wear shoes with grip and avoid climbing wet rocks around the fall base.",
    transportInfo:
      "Tuk-tuk or car recommended from Beragala; some sections are steep and narrow.",
    accessibilityInfo:
      "Uneven walking path with wet stones; not wheelchair suitable.",
    crowdLevel: "Low on weekday mornings, busier after 10:00 AM.",
    suggestedVisitDurationMinutes: 120,
    bestTimeToVisit: "Morning, November to April",
    weatherNote: "Spray and slippery paths increase during wet months.",
    safetyNote: "Do not swim close to strong falling water or slippery ledges.",
    disclaimer: safetyDisclaimer,
    isPopular: true,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Bambarakanda%20Falls.jpg",
  },
  {
    id: "diyaluma-falls",
    slug: "diyaluma-falls",
    name: "Diyaluma Falls",
    description:
      "The second-tallest waterfall in Sri Lanka (220 m) near Koslanda, known for its upper pools and wide valley views. It rewards early starts, careful walking, and enough time to enjoy both the top and lower viewpoints.",
    shortDescription:
      "Second-tallest waterfall with upper pools and valley views.",
    categoryId: "nature",
    latitude: "6.7331443",
    longitude: "81.0288424",
    address: "Koslanda Road, Diyaluma",
    distanceFromBeragalaKm: "25",
    openingHours: "Open daily during daylight hours.",
    travelTips:
      "Go with a local guide for the upper pools, and avoid the edge after rain.",
    transportInfo:
      "Car or tuk-tuk via Koslanda; upper access often needs a guide and short hike.",
    accessibilityInfo:
      "Rocky paths and water crossings; not suitable for limited mobility.",
    crowdLevel: "Moderate most weekends, quieter before 9:00 AM.",
    suggestedVisitDurationMinutes: 180,
    bestTimeToVisit: "Morning after the main monsoon",
    weatherNote: "Water levels can rise fast during rain.",
    safetyNote: "Stay far from pool edges and avoid risky photos.",
    disclaimer: safetyDisclaimer,
    isPopular: true,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Diyaluma%20Falls.jpg",
  },
  {
    id: "liptons-seat",
    slug: "liptons-seat",
    name: "Lipton's Seat",
    description:
      "A celebrated viewpoint above Dambatenne where tea fields roll into layered hills. On a clear morning, the panorama stretches across estates, ridges, and distant plains.",
    shortDescription: "Tea-country viewpoint above Dambatenne.",
    categoryId: "sightseeing",
    latitude: "6.7806559",
    longitude: "81.0129426",
    address: "Dambatenne Estate, Haputale",
    distanceFromBeragalaKm: "19",
    openingHours: "Open daily, viewpoint access usually from early morning.",
    travelTips:
      "Start early, take a jacket, and keep time for tea-estate photo stops.",
    transportInfo:
      "Tuk-tuk or car from Haputale; estate roads can be misty and narrow.",
    accessibilityInfo:
      "Vehicle access reaches close to the viewpoint; some uneven ground remains.",
    crowdLevel: "High around sunrise in peak season, low by late morning.",
    suggestedVisitDurationMinutes: 90,
    bestTimeToVisit: "Sunrise to 9:00 AM",
    weatherNote: "Cloud can cover the viewpoint after mid-morning.",
    safetyNote: "Use care on bends when walking along estate roads.",
    disclaimer: safetyDisclaimer,
    isPopular: true,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Lipton's%20Seat.jpg",
  },
  {
    id: "dambatenne-tea-factory",
    slug: "dambatenne-tea-factory",
    name: "Dambatenne Tea Factory",
    description:
      "A historic tea factory associated with the Lipton estates. Factory visits introduce rolling, drying, grading, and the working rhythm behind Uva tea production.",
    shortDescription: "Historic tea factory near Lipton's Seat.",
    categoryId: "industrial",
    latitude: "6.7833795",
    longitude: "81.0008279",
    address: "Dambatenne Estate, Haputale",
    distanceFromBeragalaKm: "15",
    openingHours: "Factory tour hours vary; call ahead before visiting.",
    travelTips:
      "Pair with Lipton's Seat in the same morning and check tour availability before leaving.",
    transportInfo:
      "Best by tuk-tuk or car from Haputale; combine with estate viewpoints.",
    accessibilityInfo:
      "Factory floors can include steps and active work areas.",
    crowdLevel: "Low outside school holidays; tour groups arrive mid-morning.",
    suggestedVisitDurationMinutes: 75,
    bestTimeToVisit: "Morning tour slots",
    weatherNote: "Mist is common around the estate roads.",
    safetyNote: "Follow factory staff instructions around machinery.",
    disclaimer: safetyDisclaimer,
    isPopular: false,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Dambatenne%20Tea%20Factory.jpg",
  },
  {
    id: "soragune-devalaya",
    slug: "soragune-devalaya",
    name: "Soragune Devalaya",
    description:
      "A heritage temple site tied to local devotion and regional history. It is a quieter cultural stop for travellers who want a grounded pause between viewpoints and waterfalls.",
    shortDescription: "Historic temple site near Haldummulla.",
    categoryId: "heritage",
    latitude: "6.7464666",
    longitude: "80.8891984",
    address: "Soragune, Haldummulla",
    distanceFromBeragalaKm: "12",
    openingHours: "Open daily; temple etiquette applies.",
    travelTips:
      "Dress modestly, remove footwear where requested, and avoid loud photography.",
    transportInfo:
      "Reachable by tuk-tuk or car from Beragala with local directions.",
    accessibilityInfo: "Temple grounds may include uneven surfaces and steps.",
    crowdLevel: "Usually quiet except during festival days.",
    suggestedVisitDurationMinutes: 60,
    bestTimeToVisit: "Morning or late afternoon",
    weatherNote: "Ground can be muddy after rain.",
    safetyNote: "Respect worship areas and local customs.",
    disclaimer: safetyDisclaimer,
    isPopular: false,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Soragune%20Devalaya.jpg",
  },
  {
    id: "idalgashinna-station",
    slug: "idalgashinna-station",
    name: "Idalgashinna Station",
    description:
      "A quiet hill-country railway station set among ridges and tea fields. It is a favourite for train watchers, misty platform photos, and slow travel moments.",
    shortDescription: "Misty mountain railway stop.",
    categoryId: "sightseeing",
    latitude: "6.7793841",
    longitude: "80.8944369",
    address: "Idalgashinna Railway Station",
    distanceFromBeragalaKm: "16",
    openingHours: "Open during railway operating hours.",
    travelTips: "Check train times before travelling and keep clear of tracks.",
    transportInfo:
      "Reach by train, tuk-tuk, or car; road access is narrow in sections.",
    accessibilityInfo:
      "Platforms and access paths can be uneven; limited wheelchair access.",
    crowdLevel: "Low most days, busier when scenic trains arrive.",
    suggestedVisitDurationMinutes: 60,
    bestTimeToVisit: "Morning mist or late afternoon light",
    weatherNote: "Fog can reduce visibility around the tracks.",
    safetyNote: "Never stand on tracks for photos.",
    disclaimer: safetyDisclaimer,
    isPopular: false,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Idalgashinna%20Station.jpg",
  },
  {
    id: "wangedigala",
    slug: "wangedigala",
    name: "Wangedigala",
    description:
      "A ridge hike above the southern escarpment with open grassland, forest patches, and sweeping views. It is best for fit travellers who can start early and handle changing weather.",
    shortDescription: "Scenic ridge hike for experienced walkers.",
    categoryId: "adventure",
    latitude: "6.7612028",
    longitude: "80.8225107",
    address: "Wangedigala Trail Area, near Kalupahana",
    distanceFromBeragalaKm: "13",
    openingHours: "Daylight hours only; start early.",
    travelTips:
      "Take enough water, a guide if unfamiliar, rain protection, and leech socks in wet months.",
    transportInfo:
      "Tuk-tuk or car to trail access points, then hiking on foot.",
    accessibilityInfo:
      "Steep, exposed hiking terrain; not wheelchair suitable.",
    crowdLevel: "Low on weekdays, small hiking groups on weekends.",
    suggestedVisitDurationMinutes: 240,
    bestTimeToVisit: "Early morning in dry weather",
    weatherNote: "Clouds and rain can move in quickly on the ridge.",
    safetyNote: "Avoid hiking in poor visibility or thunderstorms.",
    disclaimer: safetyDisclaimer,
    isPopular: false,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Wangedigala.jpg",
  },
  {
    id: "ravana-falls",
    slug: "ravana-falls",
    name: "Ravana Falls (Ravana Ella)",
    description:
      "A wide roadside waterfall close to Ella with easy viewing from the main road. It is quick to access, photogenic after rain, and often included on drives between Ella and the southern hills.",
    shortDescription: "Roadside waterfall on the route to Ella.",
    categoryId: "nature",
    latitude: "6.8432029",
    longitude: "81.0533242",
    address: "Ella-Wellawaya Road",
    distanceFromBeragalaKm: "25",
    openingHours: "Open daily during daylight hours.",
    travelTips:
      "Visit early to avoid crowds, and do not climb the wet rock face.",
    transportInfo:
      "Roadside access by bus, tuk-tuk, or car on the Ella-Wellawaya road.",
    accessibilityInfo:
      "Visible from roadside; rocks near water are slippery and uneven.",
    crowdLevel: "High during midday and holiday periods.",
    suggestedVisitDurationMinutes: 45,
    bestTimeToVisit: "Early morning or late afternoon",
    weatherNote: "Flow is stronger after rain, with more spray near the road.",
    safetyNote: "Watch traffic and avoid unsafe bathing areas.",
    disclaimer: safetyDisclaimer,
    isPopular: true,
    image:
      "https://xyyknkyzvjzojvwb.public.blob.vercel-storage.com/Ravana%20Falls.jpg",
  },
]

async function seed() {
  console.log("Seeding LocalLens data...")

  await db.delete(attractionImage)
  await db.delete(attraction)
  await db.delete(category)

  for (const item of categories) {
    await db.insert(category).values(item).onConflictDoUpdate({
      target: category.id,
      set: item,
    })
  }

  for (const item of attractions) {
    const { image, ...attractionValues } = item

    await db.insert(attraction).values(attractionValues).onConflictDoUpdate({
      target: attraction.slug,
      set: attractionValues,
    })

    await db
      .insert(attractionImage)
      .values({
        id: `${item.slug}-primary`,
        attractionId: item.id,
        url: image,
        altText: `${item.name} primary image`,
        isPrimary: true,
        position: 0,
      })
      .onConflictDoUpdate({
        target: attractionImage.id,
        set: {
          attractionId: item.id,
          url: image,
          altText: `${item.name} primary image`,
          isPrimary: true,
          position: 0,
        },
      })

    console.log(`Seeded attraction: ${item.name}`)
  }

  console.log("Seed complete.")
}

seed().catch((error) => {
  console.error("Seed error:", error)
  process.exit(1)
})
