import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="rounded-lg border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
