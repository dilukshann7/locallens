import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RatingStars } from "@/components/reviews/rating-stars"
import { ReviewForm } from "@/components/reviews/review-form"
import type { ReviewRecord } from "@/lib/reviews"

interface ReviewsSectionProps {
  attractionId: string
  reviews: ReviewRecord[]
  averageRating?: number
  reviewCount: number
  currentUserName?: string
}

export function ReviewsSection({
  attractionId,
  reviews,
  averageRating,
  reviewCount,
  currentUserName,
}: ReviewsSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-lg border-black/5 bg-white/85 shadow-[0_18px_60px_rgba(24,24,24,0.07)] backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-zinc-950">
                Reviews & ratings
              </CardTitle>
              <CardDescription>
                Recent notes from travellers around Beragala and Ella.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-md">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {reviewCount > 0 && averageRating ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <p className="text-3xl font-semibold">
                {averageRating.toFixed(1)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <RatingStars rating={averageRating} />
                <span className="text-sm text-amber-900/75">
                  Average visitor rating
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              Be the first to leave a practical tip for this stop.
            </div>
          )}

          <Separator className="my-5" />
          <ReviewForm
            attractionId={attractionId}
            currentUserName={currentUserName}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card
              key={review.id}
              size="sm"
              className="rounded-lg border-black/5 bg-white/85 shadow-sm backdrop-blur-xl"
            >
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base text-zinc-950">
                      {review.authorName}
                    </CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(review.createdAt, {
                        addSuffix: true,
                      })}
                    </CardDescription>
                  </div>
                  <RatingStars
                    rating={review.rating}
                    label={`${review.rating} out of 5 stars`}
                  />
                </div>
              </CardHeader>
              {review.body && (
                <CardContent>
                  <p className="text-sm leading-6 whitespace-pre-line text-zinc-700">
                    {review.body}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card className="rounded-lg border-dashed bg-white/70 shadow-none">
            <CardContent className="py-10 text-center text-sm text-zinc-600">
              No reviews yet. A short note about access, timing, or crowds can
              help the next traveller.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
