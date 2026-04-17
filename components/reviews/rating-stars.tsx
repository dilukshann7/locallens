import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  label?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function RatingStars({
  rating,
  label,
  size = "md",
  className,
}: RatingStarsProps) {
  const roundedRating = Math.round(rating)

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={label ?? `${rating.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= roundedRating

        return (
          <Star
            key={starValue}
            className={cn(
              sizeClasses[size],
              isFilled
                ? "fill-amber-400 text-amber-500"
                : "fill-transparent text-zinc-300"
            )}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}
