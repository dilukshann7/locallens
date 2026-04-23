import {
  CalendarDays,
  Camera,
  Globe,
  Layers,
  Sunrise,
  Trees,
  Wind,
  type LucideIcon,
} from "lucide-react"

export type Destination = {
  name: string
  elevation: string
  type: string
  time: string
  rating: number
  tag: string
  accent: string
}

export type Feature = {
  icon: LucideIcon
  label: string
  title: string
  body: string
  accent: string
}

export type Stat = {
  value: string
  label: string
  sub: string
}

export type RouteStep = {
  time: string
  place: string
  note: string
  icon: LucideIcon
  color: string
}

export const spring = {
  type: "spring" as const,
  bounce: 0,
  stiffness: 400,
  damping: 30,
}

export const micro = {
  type: "spring" as const,
  stiffness: 500,
  damping: 25,
}

export const DESTINATIONS: Destination[] = [
  {
    name: "Lipton's Seat",
    elevation: "1,970 m",
    type: "Sunrise Outlook",
    time: "45 min",
    rating: 4.9,
    tag: "iconic",
    accent: "#10b981",
  },
  {
    name: "Nine Arches Bridge",
    elevation: "1,040 m",
    type: "Rail Heritage",
    time: "55 min",
    rating: 4.8,
    tag: "unmissable",
    accent: "#f59e0b",
  },
  {
    name: "Ravana Falls",
    elevation: "1,014 m",
    type: "Waterfall",
    time: "30 min",
    rating: 4.7,
    tag: "scenic",
    accent: "#3b82f6",
  },
  {
    name: "Little Adam's Peak",
    elevation: "1,141 m",
    type: "Hike",
    time: "2 hrs",
    rating: 4.8,
    tag: "active",
    accent: "#8b5cf6",
  },
]

export const FEATURES: Feature[] = [
  {
    icon: Globe,
    label: "Map-first discovery",
    title: "See everything spatially before you commit.",
    body: "Browse scenic stops plotted by category and distance. Filter by mood — quiet mornings, active afternoons, golden-hour finishers — and watch the route take shape.",
    accent: "#10b981",
  },
  {
    icon: CalendarDays,
    label: "Gentle itinerary building",
    title: "Micro decisions stay easy as your day takes shape.",
    body: "Add, reorder, and remove stops with a planner designed for real travel energy. No spreadsheets. No friction between idea and route.",
    accent: "#f59e0b",
  },
  {
    icon: Wind,
    label: "Pace intelligence",
    title: "Plan around mist, light, and travel rhythm.",
    body: "LocalLens helps you space a day that feels calm and cinematic. Sunrise outlooks first. Tea-country walks in the middle. Rail bridges as your closing act.",
    accent: "#3b82f6",
  },
]

export const STATS: Stat[] = [
  { value: "40+", label: "Curated stops", sub: "across the hill country" },
  {
    value: "300ms",
    label: "Interaction speed",
    sub: "every tap responds fast",
  },
  { value: "3 hrs", label: "Avg plan time saved", sub: "vs manual research" },
  { value: "100%", label: "Offline-capable", sub: "maps work without signal" },
]

export const ROUTE_STEPS: RouteStep[] = [
  {
    time: "06:14",
    place: "Lipton's Seat",
    note: "Catch sunrise before the mist lifts",
    icon: Sunrise,
    color: "#f59e0b",
  },
  {
    time: "08:30",
    place: "Tea Trail Walk",
    note: "Calm 30-minute path through estates",
    icon: Trees,
    color: "#10b981",
  },
  {
    time: "10:00",
    place: "Dambatenne Factory",
    note: "Optional stop, great for context",
    icon: Layers,
    color: "#3b82f6",
  },
  {
    time: "11:40",
    place: "Nine Arches Bridge",
    note: "Best light just before noon",
    icon: Camera,
    color: "#f59e0b",
  },
]

export const NAV_LINKS = ["Explore", "Planner"]
