"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { submitReview } from "@/app/actions/reviews"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ReviewActionState } from "@/lib/reviews"

interface ReviewFormProps {
  attractionId: string
  currentUserName?: string
}

const initialState: ReviewActionState = {
  status: "idle",
}

function ReviewSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Posting review..." : "Post review"}
    </Button>
  )
}

export function ReviewForm({ attractionId, currentUserName }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [state, formAction] = useActionState(submitReview, initialState)
  const visibleRating = hoveredRating || rating

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    router.refresh()
  }, [router, state.status])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="attractionId" value={attractionId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <label className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Your rating
        </label>
        <div
          className="mt-2 flex items-center gap-1"
          onMouseLeave={() => setHoveredRating(0)}
        >
          {Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1
            const isActive = starValue <= visibleRating

            return (
              <button
                key={starValue}
                type="button"
                aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
                aria-pressed={rating === starValue}
                onMouseEnter={() => setHoveredRating(starValue)}
                onFocus={() => setHoveredRating(starValue)}
                onBlur={() => setHoveredRating(0)}
                onClick={() => setRating(starValue)}
                className="rounded-md p-1 text-zinc-300 transition-colors hover:text-amber-500 focus-visible:ring-3 focus-visible:ring-amber-300/50 focus-visible:outline-none"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive
                      ? "fill-amber-400 text-amber-500"
                      : "fill-transparent",
                    rating === starValue && "scale-110"
                  )}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>
        {state.fieldErrors?.rating && (
          <p className="mt-2 text-sm text-rose-600">
            {state.fieldErrors.rating}
          </p>
        )}
      </div>

      {currentUserName ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          Reviewing as {currentUserName}
        </p>
      ) : (
        <div>
          <label
            htmlFor="authorName"
            className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
          >
            Your name
          </label>
          <Input
            id="authorName"
            name="authorName"
            maxLength={80}
            placeholder="Name shown with your review"
            aria-invalid={Boolean(state.fieldErrors?.authorName)}
            className="mt-2"
          />
          {state.fieldErrors?.authorName && (
            <p className="mt-2 text-sm text-rose-600">
              {state.fieldErrors.authorName}
            </p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="body"
          className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
        >
          Review
        </label>
        <Textarea
          id="body"
          name="body"
          maxLength={1200}
          placeholder="Share a tip about timing, access, weather, or what made the visit worth it."
          aria-invalid={Boolean(state.fieldErrors?.body)}
          className="mt-2"
        />
        {state.fieldErrors?.body && (
          <p className="mt-2 text-sm text-rose-600">{state.fieldErrors.body}</p>
        )}
      </div>

      {state.message && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            state.status === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
          )}
        >
          {state.message}
        </p>
      )}

      <ReviewSubmitButton />
    </form>
  )
}
