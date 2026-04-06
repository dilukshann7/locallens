"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  CalendarDays,
  Leaf,
  Building,
  Eye,
  Factory,
  Mountain,
  Route,
  StickyNote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DEFAULT_DAY_START_TIME,
  formatTimeLabel,
  parseTimeToMinutes,
  transportModes,
  type PlannerStop,
} from "@/lib/planner-types"

interface DayPlannerProps {
  items: PlannerStop[]
  onReorder: (items: PlannerStop[]) => void
  onRemove: (item: PlannerStop) => void
  onClear: () => void
  dayStartTime?: string
  mode?: "compact" | "detailed"
  onUpdateItem?: (id: string, patch: Partial<PlannerStop>) => void
}

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  nature: Leaf,
  heritage: Building,
  sightseeing: Eye,
  industrial: Factory,
  adventure: Mountain,
}

export type { PlannerStop as PlannerItem }

export function DayPlanner({
  items,
  onReorder,
  onRemove,
  onClear,
  dayStartTime = DEFAULT_DAY_START_TIME,
  mode = "compact",
  onUpdateItem,
}: DayPlannerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items]
    const [removed] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, removed)
    onReorder(newItems)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      moveItem(draggedIndex, dragOverIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const schedule = useMemo(
    () =>
      items.reduce<{ arrivalMinutes: number; departureMinutes: number }[]>(
        (result, item, index) => {
          const previousDeparture =
            index === 0
              ? parseTimeToMinutes(dayStartTime)
              : result[index - 1]!.departureMinutes +
                items[index - 1]!.travelMinutes
          const departureMinutes = previousDeparture + item.visitDurationMinutes

          return [
            ...result,
            {
              arrivalMinutes: previousDeparture,
              departureMinutes,
            },
          ]
        },
        []
      ),
    [dayStartTime, items]
  )

  const totalVisitDuration = items.reduce(
    (acc, item) => acc + item.visitDurationMinutes,
    0
  )
  const totalTravelDuration = items.reduce(
    (acc, item) => acc + item.travelMinutes,
    0
  )
  const finishTime =
    schedule.length > 0
      ? formatTimeLabel(schedule[schedule.length - 1]!.departureMinutes)
      : formatTimeLabel(parseTimeToMinutes(dayStartTime))
  const totalDistance = items.reduce((acc, item) => {
    const dist = Number.parseFloat(item.distanceFromBeragalaKm || "0")
    return dist > acc ? dist : acc
  }, 0)

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader className="pb-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Your Day Plan
          </CardTitle>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="emil-button text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800/50">
              <MapPin className="h-3.5 w-3.5" />
              Max {totalDistance.toFixed(0)} km
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800/50">
              <Clock className="h-3.5 w-3.5" />
              {Math.floor(totalVisitDuration / 60)}h {totalVisitDuration % 60}m
              on site
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800/50">
              <Route className="h-3.5 w-3.5" />
              {Math.floor(totalTravelDuration / 60)}h {totalTravelDuration % 60}
              m transit
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-zinc-800/50 dark:text-emerald-400">
              <CalendarDays className="h-3.5 w-3.5" />
              Finish ~{finishTime}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-zinc-100 dark:bg-zinc-800/50">
              <CalendarDays className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Your itinerary is empty
            </p>
            <p className="mt-1 max-w-50 text-sm text-muted-foreground">
              Start adding attractions from the explorer to build your day.
            </p>
          </div>
        ) : (
          <ScrollArea
            className={cn(
              mode === "detailed"
                ? "h-[calc(100vh-280px)]"
                : "h-[calc(100vh-320px)]",
              "px-4 sm:px-6"
            )}
          >
            <div className="space-y-4 pb-6">
              {items.map((item, index) => {
                const IconComponent =
                  categoryIcons[item.category?.slug || "sightseeing"]
                const isBeingDragged = draggedIndex === index
                const isDragOver = dragOverIndex === index
                const arrivalLabel = formatTimeLabel(
                  schedule[index]!.arrivalMinutes
                )
                const departureLabel = formatTimeLabel(
                  schedule[index]!.departureMinutes
                )
                const travelLabel =
                  index === items.length - 1
                    ? "Return / onward"
                    : "To next stop"

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "stagger-item group relative rounded-[1.5rem] border border-border/60 bg-background p-4 transition-all duration-300 ease-out hover:border-zinc-300 hover:shadow-md sm:p-5 dark:hover:border-zinc-700",
                      isBeingDragged && "scale-95 opacity-50 shadow-xl",
                      isDragOver && "scale-[1.02] border-2 border-emerald-500"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex cursor-grab flex-col items-center gap-1.5 pt-1 opacity-40 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            onClick={() =>
                              index > 0 && moveItem(index, index - 1)
                            }
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            onClick={() =>
                              index < items.length - 1 &&
                              moveItem(index, index + 1)
                            }
                            disabled={index === items.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="mb-1.5 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-zinc-600 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                              >
                                Stop {index + 1}
                              </Badge>
                              {IconComponent && (
                                <IconComponent className="h-3.5 w-3.5 text-zinc-400" />
                              )}
                              <span className="text-xs font-semibold text-zinc-500">
                                {item.category?.name}
                              </span>
                            </div>
                            <h4 className="line-clamp-1 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                              {item.name}
                            </h4>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                Arr {arrivalLabel}
                              </span>
                              <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block dark:bg-zinc-700" />
                              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-bold dark:bg-zinc-800">
                                Dep {departureLabel}
                              </span>
                              {item.distanceFromBeragalaKm && (
                                <>
                                  <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block dark:bg-zinc-700" />
                                  <span>
                                    {item.distanceFromBeragalaKm} km from start
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="emil-button h-8 w-8 rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                            onClick={() => onRemove(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {mode === "detailed" ? (
                          <div className="space-y-4 rounded-[1rem] bg-zinc-50/80 p-4 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/80 dark:ring-zinc-800/50">
                            <div className="grid gap-4 sm:grid-cols-3">
                              <label className="space-y-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                Stay duration
                                <input
                                  type="number"
                                  min={15}
                                  step={15}
                                  value={item.visitDurationMinutes}
                                  onChange={(event) =>
                                    onUpdateItem?.(item.id, {
                                      visitDurationMinutes: Math.max(
                                        15,
                                        Number.parseInt(
                                          event.target.value || "15",
                                          10
                                        )
                                      ),
                                    })
                                  }
                                  className="emil-transition h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                                />
                              </label>

                              <label className="space-y-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                {travelLabel} transport
                                <select
                                  value={item.transportMode}
                                  onChange={(event) =>
                                    onUpdateItem?.(item.id, {
                                      transportMode: event.target
                                        .value as PlannerStop["transportMode"],
                                    })
                                  }
                                  className="emil-transition h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                                >
                                  {transportModes.map((transportMode) => (
                                    <option
                                      key={transportMode.value}
                                      value={transportMode.value}
                                    >
                                      {transportMode.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="space-y-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                {travelLabel} minutes
                                <input
                                  type="number"
                                  min={0}
                                  step={5}
                                  value={item.travelMinutes}
                                  onChange={(event) =>
                                    onUpdateItem?.(item.id, {
                                      travelMinutes: Math.max(
                                        0,
                                        Number.parseInt(
                                          event.target.value || "0",
                                          10
                                        )
                                      ),
                                    })
                                  }
                                  className="emil-transition h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                                />
                              </label>
                            </div>

                            <label className="block space-y-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                              <span className="flex items-center gap-1.5">
                                <StickyNote className="h-3.5 w-3.5" />
                                Stop notes
                              </span>
                              <textarea
                                value={item.notes}
                                onChange={(event) =>
                                  onUpdateItem?.(item.id, {
                                    notes: event.target.value,
                                  })
                                }
                                rows={2}
                                placeholder="Add timing reminders, ticket notes, food stops, or what to do here..."
                                className="emil-transition w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 outline-none hover:border-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:border-emerald-500"
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                              {item.visitDurationMinutes} min stay
                            </span>
                            <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block dark:bg-zinc-700" />
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                              {item.transportMode} {item.travelMinutes} min
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}{" "}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
