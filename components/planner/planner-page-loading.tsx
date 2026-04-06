import { Skeleton } from "@/components/ui/skeleton"

export function PlannerPageLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="sticky top-0 z-40 border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="h-11 w-64 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <Skeleton className="h-10 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-28 rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900 dark:ring-zinc-800/60" />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <Skeleton className="h-152 rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900 dark:ring-zinc-800/60" />
          <div className="space-y-6">
            <Skeleton className="h-52 rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900 dark:ring-zinc-800/60" />
            <Skeleton className="h-64 rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900 dark:ring-zinc-800/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
