import { and, desc, eq, inArray, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { attraction, attractionImage, category, review } from "@/lib/db/schema"

export interface AttractionCategory {
  id: string
  name: string
  slug: string
}

export interface AttractionRecord {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  categoryId?: string
  latitude?: string
  longitude?: string
  address?: string
  distanceFromBeragalaKm?: string
  images?: string[]
  primaryImageUrl?: string
  openingHours?: string
  travelTips?: string
  estimatedCostLkr?: number
  transportInfo?: string
  accessibilityInfo?: string
  crowdLevel?: string
  suggestedVisitDurationMinutes?: number
  bestTimeToVisit?: string
  weatherNote?: string
  safetyNote?: string
  disclaimer?: string
  isPopular: boolean
  isActive: boolean
  category?: AttractionCategory
  averageRating?: number
  reviewCount: number
}

interface ReviewSummary {
  averageRating?: number
  reviewCount: number
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
  slug: attraction.slug,
  description: attraction.description,
  shortDescription: attraction.shortDescription,
  categoryId: attraction.categoryId,
  latitude: attraction.latitude,
  longitude: attraction.longitude,
  address: attraction.address,
  distanceFromBeragalaKm: attraction.distanceFromBeragalaKm,
  openingHours: attraction.openingHours,
  travelTips: attraction.travelTips,
  estimatedCostLkr: attraction.estimatedCostLkr,
  transportInfo: attraction.transportInfo,
  accessibilityInfo: attraction.accessibilityInfo,
  crowdLevel: attraction.crowdLevel,
  suggestedVisitDurationMinutes: attraction.suggestedVisitDurationMinutes,
  bestTimeToVisit: attraction.bestTimeToVisit,
  weatherNote: attraction.weatherNote,
  safetyNote: attraction.safetyNote,
  disclaimer: attraction.disclaimer,
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
  slug: string
  description: string
  shortDescription: string | null
  categoryId: string | null
  latitude: string | null
  longitude: string | null
  address: string | null
  distanceFromBeragalaKm: string | null
  openingHours: string | null
  travelTips: string | null
  estimatedCostLkr: number | null
  transportInfo: string | null
  accessibilityInfo: string | null
  crowdLevel: string | null
  suggestedVisitDurationMinutes: number | null
  bestTimeToVisit: string | null
  weatherNote: string | null
  safetyNote: string | null
  disclaimer: string | null
  isPopular: boolean
  isActive: boolean
  category: {
    id: string | null
    name: string | null
    slug: string | null
  } | null
}

function normalizeAttraction(
  row: AttractionQueryRow,
  summary?: ReviewSummary,
  images: string[] = []
): AttractionRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription ?? undefined,
    categoryId: row.categoryId ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    address: row.address ?? undefined,
    distanceFromBeragalaKm: row.distanceFromBeragalaKm ?? undefined,
    images: images.length > 0 ? images : undefined,
    primaryImageUrl: images[0],
    openingHours: row.openingHours ?? undefined,
    travelTips: row.travelTips ?? undefined,
    estimatedCostLkr: row.estimatedCostLkr ?? undefined,
    transportInfo: row.transportInfo ?? undefined,
    accessibilityInfo: row.accessibilityInfo ?? undefined,
    crowdLevel: row.crowdLevel ?? undefined,
    suggestedVisitDurationMinutes:
      row.suggestedVisitDurationMinutes ?? undefined,
    bestTimeToVisit: row.bestTimeToVisit ?? undefined,
    weatherNote: row.weatherNote ?? undefined,
    safetyNote: row.safetyNote ?? undefined,
    disclaimer: row.disclaimer ?? undefined,
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
    averageRating: summary?.averageRating,
    reviewCount: summary?.reviewCount ?? 0,
  }
}

async function getAttractionImages(
  attractionIds: string[]
): Promise<Map<string, string[]>> {
  if (attractionIds.length === 0) {
    return new Map()
  }

  const rows = await db
    .select({
      attractionId: attractionImage.attractionId,
      url: attractionImage.url,
    })
    .from(attractionImage)
    .where(inArray(attractionImage.attractionId, attractionIds))
    .orderBy(
      desc(attractionImage.isPrimary),
      attractionImage.position,
      attractionImage.createdAt
    )

  const imagesByAttractionId = new Map<string, string[]>()

  for (const row of rows) {
    const images = imagesByAttractionId.get(row.attractionId) ?? []
    images.push(row.url)
    imagesByAttractionId.set(row.attractionId, images)
  }

  return imagesByAttractionId
}

async function getReviewSummaries(
  attractionIds: string[]
): Promise<Map<string, ReviewSummary>> {
  if (attractionIds.length === 0) {
    return new Map()
  }

  const rows = await db
    .select({
      attractionId: review.attractionId,
      rating: review.rating,
    })
    .from(review)
    .where(inArray(review.attractionId, attractionIds))

  const accumulators = new Map<
    string,
    {
      ratingTotal: number
      reviewCount: number
    }
  >()

  for (const row of rows) {
    const existing = accumulators.get(row.attractionId) ?? {
      ratingTotal: 0,
      reviewCount: 0,
    }

    existing.ratingTotal += row.rating
    existing.reviewCount += 1
    accumulators.set(row.attractionId, existing)
  }

  return new Map(
    Array.from(accumulators.entries()).map(([attractionId, value]) => [
      attractionId,
      {
        averageRating:
          Math.round((value.ratingTotal / value.reviewCount) * 10) / 10,
        reviewCount: value.reviewCount,
      },
    ])
  )
}

export async function getActiveAttractions(): Promise<AttractionRecord[]> {
  const rows = await db
    .select(attractionSelect)
    .from(attraction)
    .leftJoin(category, eq(attraction.categoryId, category.id))
    .where(eq(attraction.isActive, true))
    .orderBy(desc(attraction.isPopular), attraction.name)

  const summaries = await getReviewSummaries(rows.map((row) => row.id))
  const images = await getAttractionImages(rows.map((row) => row.id))

  return rows.map((row) =>
    normalizeAttraction(row, summaries.get(row.id), images.get(row.id))
  )
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

  const summaries = await getReviewSummaries(rows.map((row) => row.id))
  const images = await getAttractionImages(rows.map((row) => row.id))
  const attractionsById = new Map(
    rows.map((row) => {
      const normalized = normalizeAttraction(
        row,
        summaries.get(row.id),
        images.get(row.id)
      )
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

  if (!row) {
    return null
  }

  const summaries = await getReviewSummaries([row.id])
  const images = await getAttractionImages([row.id])

  return normalizeAttraction(row, summaries.get(row.id), images.get(row.id))
}

export async function getActiveAttractionBySlugOrId(
  identifier: string
): Promise<AttractionRecord | null> {
  const row = await db
    .select(attractionSelect)
    .from(attraction)
    .leftJoin(category, eq(attraction.categoryId, category.id))
    .where(
      and(
        or(eq(attraction.id, identifier), eq(attraction.slug, identifier)),
        eq(attraction.isActive, true)
      )
    )
    .then((rows) => rows[0] ?? null)

  if (!row) {
    return null
  }

  const summaries = await getReviewSummaries([row.id])
  const images = await getAttractionImages([row.id])
  return normalizeAttraction(row, summaries.get(row.id), images.get(row.id))
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
