"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  X,
  ImagePlus,
  Save,
  Loader2,
  Sparkles,
  MapPin,
  Info,
  Image as ImageIcon,
} from "lucide-react"
import Image from "next/image"

interface Attraction {
  id?: string
  name: string
  description: string
  shortDescription?: string
  categoryId?: string
  latitude: string
  longitude: string
  address?: string
  distanceFromBeragalaKm?: string
  images?: string[]
  suggestedVisitDurationMinutes?: number
  bestTimeToVisit?: string
  weatherNote?: string
  safetyNote?: string
  isPopular?: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

interface AddressSuggestion {
  place_id: number
  lat: string
  lon: string
  name?: string
  display_name: string
}

interface AttractionFormProps {
  attraction?: Attraction
  categories: Category[]
}

const InputField = ({
  label,
  id,
  ...props
}: {
  label: string
  id: string
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
    >
      {label}
    </label>
    <input
      id={id}
      className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-700 dark:focus-visible:ring-zinc-700"
      {...props}
    />
  </div>
)

const TextAreaField = ({
  label,
  id,
  ...props
}: {
  label: string
  id: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
    >
      {label}
    </label>
    <textarea
      id={id}
      className="flex min-h-30 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-700 dark:focus-visible:ring-zinc-700"
      {...props}
    />
  </div>
)

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800/50 dark:bg-zinc-900/20">
        <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export function AttractionForm({
  attraction,
  categories,
}: AttractionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(attraction?.images || [])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchingAddress, setSearchingAddress] = useState(false)
  const isTypingAddress = useRef(false)

  const [newId] = useState(
    () => `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  )
  const targetId = attraction?.id || newId

  const [formData, setFormData] = useState({
    name: attraction?.name || "",
    description: attraction?.description || "",
    shortDescription: attraction?.shortDescription || "",
    categoryId: attraction?.categoryId || "",
    latitude: attraction?.latitude || "",
    longitude: attraction?.longitude || "",
    address: attraction?.address || "",
    distanceFromBeragalaKm: attraction?.distanceFromBeragalaKm || "",
    suggestedVisitDurationMinutes:
      attraction?.suggestedVisitDurationMinutes?.toString() || "",
    bestTimeToVisit: attraction?.bestTimeToVisit || "",
    weatherNote: attraction?.weatherNote || "",
    safetyNote: attraction?.safetyNote || "",
    isPopular: attraction?.isPopular || false,
  })

  useEffect(() => {
    if (!isTypingAddress.current) return

    const searchAddress = async () => {
      if (!formData.address || formData.address.length < 3) {
        setAddressSuggestions([])
        setShowSuggestions(false)
        return
      }

      setSearchingAddress(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
            formData.address
          )}`
        )
        const data = await res.json()
        setAddressSuggestions(data)
        setShowSuggestions(true)
      } catch (e) {
        console.error("Address search failed", e)
      } finally {
        setSearchingAddress(false)
      }
    }

    const timer = setTimeout(searchAddress, 600)
    return () => clearTimeout(timer)
  }, [formData.address])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of Array.from(files)) {
      try {
        const payload = new FormData()
        payload.append("file", file)
        payload.append("attractionId", targetId)

        const response = await fetch("/api/blob", {
          method: "POST",
          body: payload,
        })

        if (response.ok) {
          const { url } = await response.json()
          uploadedUrls.push(url)
        }
      } catch (error) {
        console.error("Upload failed:", error)
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls])
    setUploading(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        id: targetId,
        ...formData,
        categoryId: formData.categoryId || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        distanceFromBeragalaKm: formData.distanceFromBeragalaKm || null,
        suggestedVisitDurationMinutes: formData.suggestedVisitDurationMinutes
          ? parseInt(formData.suggestedVisitDurationMinutes)
          : null,
        images: images.length > 0 ? images : null,
        isPopular: formData.isPopular,
      }

      const url = attraction?.id
        ? `/api/attractions/${attraction.id}`
        : "/api/attractions"

      const method = attraction?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push("/admin/attractions")
        router.refresh()
      } else {
        alert("Failed to save attraction")
      }
    } catch (error) {
      console.error("Save failed:", error)
      alert("Failed to save attraction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      <Section title="Basic Information" icon={Info}>
        <div className="space-y-6">
          <InputField
            label="Name *"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="E.g., Bambarakanda Falls"
          />

          <InputField
            label="Short Description"
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
            placeholder="A brief 1-2 sentence summary for cards"
          />

          <TextAreaField
            label="Full Description *"
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            placeholder="Detailed description of the attraction..."
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Category
            </label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/50">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/20">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Highlight as Popular
              </label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                This will display a &quot;Popular&quot; badge on the attraction
                card.
              </p>
            </div>
            <Switch
              checked={formData.isPopular}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPopular: checked })
              }
            />
          </div>
        </div>
      </Section>

      <Section title="Location Data" icon={MapPin}>
        <div className="space-y-6">
          <div className="relative space-y-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Address / Location Name
            </label>
            <input
              id="address"
              value={formData.address}
              onChange={(e) => {
                isTypingAddress.current = true
                setFormData({ ...formData, address: e.target.value })
              }}
              onFocus={() => {
                if (addressSuggestions.length > 0) setShowSuggestions(true)
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-700 dark:focus-visible:ring-zinc-700"
              placeholder="E.g., Ohiya Road, Kalupahana"
              autoComplete="off"
            />
            {searchingAddress && (
              <Loader2 className="absolute top-9 right-3 h-4 w-4 animate-spin text-zinc-400" />
            )}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                {addressSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => {
                      isTypingAddress.current = false
                      setFormData({
                        ...formData,
                        address:
                          suggestion.name ||
                          suggestion.display_name.split(",")[0],
                        latitude: suggestion.lat,
                        longitude: suggestion.lon,
                      })
                      setShowSuggestions(false)
                    }}
                    className="flex w-full flex-col items-start border-b border-zinc-100 px-4 py-2.5 text-left text-sm transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <span className="line-clamp-1 font-medium text-zinc-900 dark:text-zinc-50">
                      {suggestion.name || suggestion.display_name.split(",")[0]}
                    </span>
                    <span className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {suggestion.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <InputField
              label="Latitude"
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) =>
                setFormData({ ...formData, latitude: e.target.value })
              }
              placeholder="6.7989"
            />
            <InputField
              label="Longitude"
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) =>
                setFormData({ ...formData, longitude: e.target.value })
              }
              placeholder="80.8234"
            />
          </div>

          <InputField
            label="Distance from Beragala (km)"
            id="distance"
            type="number"
            step="0.01"
            value={formData.distanceFromBeragalaKm}
            onChange={(e) =>
              setFormData({
                ...formData,
                distanceFromBeragalaKm: e.target.value,
              })
            }
            placeholder="3.5"
          />
        </div>
      </Section>

      <Section title="Visit Details" icon={Sparkles}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField
            label="Suggested Duration (mins)"
            id="duration"
            type="number"
            value={formData.suggestedVisitDurationMinutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                suggestedVisitDurationMinutes: e.target.value,
              })
            }
            placeholder="120"
          />

          <InputField
            label="Best Time to Visit"
            id="bestTime"
            value={formData.bestTimeToVisit}
            onChange={(e) =>
              setFormData({ ...formData, bestTimeToVisit: e.target.value })
            }
            placeholder="Early morning, before 10 AM"
          />

          <InputField
            label="Weather Note"
            id="weather"
            value={formData.weatherNote}
            onChange={(e) =>
              setFormData({ ...formData, weatherNote: e.target.value })
            }
            placeholder="Can be very misty during rainy season"
          />

          <InputField
            label="Safety Note"
            id="safety"
            value={formData.safetyNote}
            onChange={(e) =>
              setFormData({ ...formData, safetyNote: e.target.value })
            }
            placeholder="Beware of leeches during wet weather"
          />
        </div>
      </Section>

      <Section title="Media Gallery" icon={ImageIcon}>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload Photos"}
            </button>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Image
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-900 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:scale-110 dark:bg-zinc-950/90 dark:text-zinc-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-900/20">
              <ImageIcon className="mb-4 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                No images uploaded
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Upload photos to showcase this attraction.
              </p>
            </div>
          )}
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/80 p-4 backdrop-blur-xl sm:left-72 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-medium text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {attraction ? "Save Changes" : "Create Attraction"}
          </button>
        </div>
      </div>
    </form>
  )
}
