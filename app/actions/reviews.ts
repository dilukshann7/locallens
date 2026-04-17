"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUserRecord } from "@/lib/auth/session"
import {
  activeAttractionExists,
  createReview,
  type ReviewActionState,
} from "@/lib/reviews"

function getStringField(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

export async function submitReview(
  _previousState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const attractionId = getStringField(formData, "attractionId")
  const authorName = getStringField(formData, "authorName")
  const body = getStringField(formData, "body")
  const ratingValue = Number(getStringField(formData, "rating"))
  const currentUser = await getCurrentUserRecord()

  const fieldErrors: NonNullable<ReviewActionState["fieldErrors"]> = {}

  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    fieldErrors.rating = "Choose a rating from 1 to 5 stars."
  }

  if (!currentUser && authorName.length === 0) {
    fieldErrors.authorName = "Add your name or log in before reviewing."
  }

  if (authorName.length > 80) {
    fieldErrors.authorName = "Keep your name under 80 characters."
  }

  if (body.length > 1200) {
    fieldErrors.body = "Keep your review under 1200 characters."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    }
  }

  if (!attractionId || !(await activeAttractionExists(attractionId))) {
    return {
      status: "error",
      message: "This attraction is no longer available for reviews.",
    }
  }

  await createReview({
    attractionId,
    userId: currentUser?.id,
    authorName: currentUser?.name ?? authorName,
    rating: ratingValue,
    body: body.length > 0 ? body : undefined,
  })

  revalidatePath("/")
  revalidatePath(`/attractions/${attractionId}`)

  return {
    status: "success",
    message: "Thanks. Your review is now visible.",
  }
}
