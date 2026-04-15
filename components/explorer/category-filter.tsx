"use client"

import { Badge } from "@/components/ui/badge"
import { Leaf, Building, Eye, Factory, Mountain } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
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

const categoryColors: Record<string, string> = {
  nature: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500",
  heritage: "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",
  sightseeing: "bg-sky-500 hover:bg-sky-600 text-white border-sky-500",
  industrial: "bg-orange-500 hover:bg-orange-600 text-white border-orange-500",
  adventure: "bg-rose-500 hover:bg-rose-600 text-white border-rose-500",
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selectedCategory === null ? "default" : "outline"}
        className={`cursor-pointer px-4 py-4 transition-all duration-200 hover:scale-105 ${
          selectedCategory === null
            ? "bg-primary hover:bg-primary/90"
            : "hover:bg-muted"
        }`}
        onClick={() => onSelectCategory(null)}
      >
        All Places
      </Badge>
      {categories.map((category) => {
        const IconComponent = categoryIcons[category.slug]
        const isSelected = selectedCategory === category.slug

        return (
          <Badge
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer gap-1.5 px-4 py-4 transition-all duration-200 hover:scale-105 ${
              isSelected
                ? categoryColors[category.slug] || "bg-primary"
                : "hover:bg-muted"
            }`}
            onClick={() => onSelectCategory(category.slug)}
          >
            {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
            {category.name}
          </Badge>
        )
      })}
    </div>
  )
}
