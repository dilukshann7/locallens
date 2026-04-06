import { and, desc, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { attraction, category } from "@/lib/db/schema"

export interface AttractionCategory {
  id: string
  name: string
  slug: string
}

export interface AttractionRecord {
  id: string
  name: string
  description: string
  shortDescription?: string
  categoryId?: string
  latitude?: string
  longitude?: string
  address?: string
  distanceFromBeragalaKm?: string
  images?: string[]
  suggestedVisitDurationMinutes?: number
  bestTimeToVisit?: string
  weatherNote?: string
  safetyNote?: string
  isPopular: boolean
  isActive: boolean
  category?: AttractionCategory
}

export interface CategoryRecord {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
}

const attractionSelect = {
  id: attraction.id,
  name: attraction.name,
  description: attraction.description,
  shortDescription: attraction.shortDescription,
  categoryId: attraction.categoryId,
  latitude: attraction.latitude,
  longitude: attraction.longitude,
  address: attraction.address,
  distanceFromBeragalaKm: attraction.distanceFromBeragalaKm,
  images: attraction.images,
  suggestedVisitDurationMinutes: attraction.suggestedVisitDurationMinutes,
  bestTimeToVisit: attraction.bestTimeToVisit,
  weatherNote: attraction.weatherNote,
  safetyNote: attraction.safetyNote,
  isPopular: attraction.isPopular,
  isActive: attraction.isActive,
  category: {
    id: category.id,
    name: category.name,
    slug: category.slug,
  },
}

interface AttractionQueryRow {
  id: string
  name: string
  description: string
  shortDescription: string | null
  categoryId: string | null
  latitude: string | null
  longitude: string | null
  address: string | null
  distanceFromBeragalaKm: string | null
  images: string[] | null
  suggestedVisitDurationMinutes: number | null
  bestTimeToVisit: string | null
  weatherNote: string | null
  safetyNote: string | null
  isPopular: boolean
  isActive: boolean
  category: {
    id: string | null
    name: string | null
    slug: string | null
  } | null
}

function normalizeAttraction(row: AttractionQueryRow): AttractionRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    shortDescription: row.shortDescription ?? undefined,
    categoryId: row.categoryId ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    address: row.address ?? undefined,
    distanceFromBeragalaKm: row.distanceFromBeragalaKm ?? undefined,
    images: row.images ?? undefined,
    suggestedVisitDurationMinutes:
      row.suggestedVisitDurationMinutes ?? undefined,
    bestTimeToVisit: row.bestTimeToVisit ?? undefined,
    weatherNote: row.weatherNote ?? undefined,
    safetyNote: row.safetyNote ?? undefined,
    isPopular: row.isPopular,
    isActive: row.isActive,
    category:
      row.category?.id && row.category.name && row.category.slug
        ? {
            id: row.category.id,
            name: row.category.name,
            slug: row.category.slug,
          }
        : undefined,
  }
}

export async function getActiveAttractions(): Promise<AttractionRecord[]> {
  const rows = await db
    .select(attractionSelect)
    .from(attraction)
    .leftJoin(category, eq(attraction.categoryId, category.id))
    .where(eq(attraction.isActive, true))
    .orderBy(desc(attraction.isPopular), attraction.name)

  return rows.map(normalizeAttraction)
}

export async function getActiveAttractionsByIds(
  attractionIds: string[]
): Promise<AttractionRecord[]> {
  if (attractionIds.length === 0) {
    return []
  }

  const rows = await db
    .select(attractionSelect)
    .from(attraction)
    .leftJoin(category, eq(attraction.categoryId, category.id))
    .where(
      and(inArray(attraction.id, attractionIds), eq(attraction.isActive, true))
    )

  const attractionsById = new Map(
    rows.map((row) => {
      const normalized = normalizeAttraction(row)
      return [normalized.id, normalized] as const
    })
  )

  return attractionIds
    .map((id) => attractionsById.get(id))
    .filter((item): item is AttractionRecord => Boolean(item))
}

export async function getActiveAttractionById(
  id: string
): Promise<AttractionRecord | null> {
  const row = await db
    .select(attractionSelect)
    .from(attraction)
    .leftJoin(category, eq(attraction.categoryId, category.id))
    .where(and(eq(attraction.id, id), eq(attraction.isActive, true)))
    .then((rows) => rows[0] ?? null)

  return row ? normalizeAttraction(row) : null
}

export async function getCategories(): Promise<CategoryRecord[]> {
  const rows = await db.select().from(category).orderBy(category.name)

  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    icon: item.icon ?? undefined,
    description: item.description ?? undefined,
  }))
}
