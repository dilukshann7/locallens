import { Skeleton } from "@/components/ui/skeleton"

export function TouristExplorerLoading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f5_0%,#f3efe6_45%,#eef3ea_100%)]">
      <div className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-11 w-full max-w-md rounded-full bg-black/6" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24 rounded-full bg-black/6" />
              <Skeleton className="h-10 w-28 rounded-full bg-black/6" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-10 w-28 rounded-full bg-black/6"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-10 w-52 rounded-full bg-black/6" />
          <Skeleton className="h-6 w-28 rounded-full bg-black/6" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 shadow-sm"
            >
              <Skeleton className="aspect-4/3 rounded-none bg-black/6" />
              <div className="space-y-4 p-5">
                <Skeleton className="h-4 w-24 rounded-full bg-black/6" />
                <Skeleton className="h-7 w-3/4 rounded-full bg-black/6" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded-full bg-black/6" />
                  <Skeleton className="h-4 w-4/5 rounded-full bg-black/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
