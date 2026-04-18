import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { attraction, review } from "@/lib/db/schema"

export interface ReviewRecord {
  id: string
  attractionId: string
  userId?: string
  authorName: string
  rating: number
  body?: string
  createdAt: Date
}

export interface ReviewActionState {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    authorName?: string
    rating?: string
    body?: string
  }
}

interface ReviewQueryRow {
  id: string
  attractionId: string
  userId: string | null
  authorName: string
  rating: number
  body: string | null
  createdAt: Date
}

function normalizeReview(row: ReviewQueryRow): ReviewRecord {
  return {
    id: row.id,
    attractionId: row.attractionId,
    userId: row.userId ?? undefined,
    authorName: row.authorName,
    rating: row.rating,
    body: row.body ?? undefined,
    createdAt: row.createdAt,
  }
}

export async function getReviewsByAttractionId(
  attractionId: string
): Promise<ReviewRecord[]> {
  const rows = await db
    .select({
      id: review.id,
      attractionId: review.attractionId,
      userId: review.userId,
      authorName: review.authorName,
      rating: review.rating,
      body: review.body,
      createdAt: review.createdAt,
    })
    .from(review)
    .where(eq(review.attractionId, attractionId))
    .orderBy(desc(review.createdAt))

  return rows.map(normalizeReview)
}

export async function getReviewsForAttraction(attractionId: string): Promise<{
  reviews: ReviewRecord[]
  averageRating?: number
  reviewCount: number
}> {
  const reviews = await getReviewsByAttractionId(attractionId)
  const reviewCount = reviews.length
  const averageRating =
    reviewCount > 0
      ? Math.round(
          (reviews.reduce((total, item) => total + item.rating, 0) /
            reviewCount) *
            10
        ) / 10
      : undefined

  return {
    reviews,
    averageRating,
    reviewCount,
  }
}

export async function activeAttractionExists(
  attractionId: string
): Promise<boolean> {
  const row = await db
    .select({ id: attraction.id })
    .from(attraction)
    .where(and(eq(attraction.id, attractionId), eq(attraction.isActive, true)))
    .then((rows) => rows[0] ?? null)

  return Boolean(row)
}

export async function createReview(input: {
  attractionId: string
  userId?: string
  authorName: string
  rating: number
  body?: string
}): Promise<void> {
  await db.insert(review).values({
    id: crypto.randomUUID(),
    attractionId: input.attractionId,
    userId: input.userId ?? null,
    authorName: input.authorName,
    rating: input.rating,
    body: input.body ?? null,
  })
}
