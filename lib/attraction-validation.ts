export interface AttractionMutationInput {
  id?: string
  name: string
  slug: string
  description: string
  shortDescription: string | null
  categoryId: string | null
  latitude: string
  longitude: string
  address: string | null
  distanceFromBeragalaKm: string | null
  openingHours: string | null
  travelTips: string | null
  estimatedCostLkr: number | null
  transportInfo: string | null
  accessibilityInfo: string | null
  crowdLevel: string | null
  suggestedVisitDurationMinutes: number | null
  bestTimeToVisit: string | null
  weatherNote: string | null
  safetyNote: string | null
  disclaimer: string | null
  isPopular: boolean
  images: string[]
}

export type AttractionValidationResult =
  | {
      success: true
      data: AttractionMutationInput
    }
  | {
      success: false
      error: string
    }

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const urlPattern = /^(https?:\/\/|\/)[^\s]+$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getTrimmedString(body: Record<string, unknown>, key: string): string {
  const value = body[key]
  return typeof value === "string" ? value.trim() : ""
}

function getNullableString(
  body: Record<string, unknown>,
  key: string,
  maxLength = 2000
): string | null {
  const value = getTrimmedString(body, key)
  return value.length > 0 ? value.slice(0, maxLength) : null
}

function getRequiredString(
  body: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number
): { value: string } | { error: string } {
  const value = getTrimmedString(body, key)

  if (!value) {
    return { error: `${label} is required.` }
  }

  if (value.length > maxLength) {
    return { error: `${label} must be ${maxLength} characters or less.` }
  }

  return { value }
}

function getNumericString(
  body: Record<string, unknown>,
  key: string,
  label: string,
  options: {
    required?: boolean
    min?: number
    max?: number
  } = {}
): { value: string | null } | { error: string } {
  const raw = body[key]
  const value =
    typeof raw === "number"
      ? raw.toString()
      : typeof raw === "string"
        ? raw.trim()
        : ""

  if (!value) {
    return options.required
      ? { error: `${label} is required.` }
      : { value: null }
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return { error: `${label} must be a valid number.` }
  }

  if (typeof options.min === "number" && parsed < options.min) {
    return { error: `${label} must be at least ${options.min}.` }
  }

  if (typeof options.max === "number" && parsed > options.max) {
    return { error: `${label} must be ${options.max} or less.` }
  }

  return { value }
}

function getInteger(
  body: Record<string, unknown>,
  key: string,
  label: string,
  options: {
    min?: number
    max?: number
  } = {}
): { value: number | null } | { error: string } {
  const raw = body[key]
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && raw.trim()
        ? Number(raw.trim())
        : null

  if (value === null) {
    return { value: null }
  }

  if (!Number.isInteger(value)) {
    return { error: `${label} must be a whole number.` }
  }

  if (typeof options.min === "number" && value < options.min) {
    return { error: `${label} must be at least ${options.min}.` }
  }

  if (typeof options.max === "number" && value > options.max) {
    return { error: `${label} must be ${options.max} or less.` }
  }

  return { value }
}

function parseImages(body: Record<string, unknown>): string[] {
  const rawImages = body.images

  if (!Array.isArray(rawImages)) {
    return []
  }

  return rawImages
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && urlPattern.test(value))
    .slice(0, 12)
}

export function validateAttractionPayload(
  body: unknown
): AttractionValidationResult {
  if (!isRecord(body)) {
    return { success: false, error: "Invalid attraction payload." }
  }

  const name = getRequiredString(body, "name", "Name", 120)
  if ("error" in name) return { success: false, error: name.error }

  const description = getRequiredString(
    body,
    "description",
    "Description",
    6000
  )
  if ("error" in description) {
    return { success: false, error: description.error }
  }

  const slug = getRequiredString(body, "slug", "Slug", 140)
  if ("error" in slug) return { success: false, error: slug.error }

  if (!slugPattern.test(slug.value)) {
    return {
      success: false,
      error: "Slug can contain lowercase letters, numbers, and hyphens only.",
    }
  }

  const latitude = getNumericString(body, "latitude", "Latitude", {
    required: true,
    min: -90,
    max: 90,
  })
  if ("error" in latitude) return { success: false, error: latitude.error }

  const longitude = getNumericString(body, "longitude", "Longitude", {
    required: true,
    min: -180,
    max: 180,
  })
  if ("error" in longitude) return { success: false, error: longitude.error }

  const distance = getNumericString(
    body,
    "distanceFromBeragalaKm",
    "Distance",
    { min: 0, max: 999 }
  )
  if ("error" in distance) return { success: false, error: distance.error }

  const duration = getInteger(
    body,
    "suggestedVisitDurationMinutes",
    "Suggested duration",
    { min: 15, max: 1440 }
  )
  if ("error" in duration) return { success: false, error: duration.error }

  const cost = getInteger(body, "estimatedCostLkr", "Estimated cost", {
    min: 0,
    max: 1000000,
  })
  if ("error" in cost) return { success: false, error: cost.error }

  return {
    success: true,
    data: {
      id: getNullableString(body, "id", 140) ?? undefined,
      name: name.value,
      slug: slug.value,
      description: description.value,
      shortDescription: getNullableString(body, "shortDescription", 280),
      categoryId: getNullableString(body, "categoryId", 140),
      latitude: latitude.value ?? "",
      longitude: longitude.value ?? "",
      address: getNullableString(body, "address", 500),
      distanceFromBeragalaKm: distance.value,
      openingHours: getNullableString(body, "openingHours", 500),
      travelTips: getNullableString(body, "travelTips", 2000),
      estimatedCostLkr: cost.value,
      transportInfo: getNullableString(body, "transportInfo", 2000),
      accessibilityInfo: getNullableString(body, "accessibilityInfo", 2000),
      crowdLevel: getNullableString(body, "crowdLevel", 500),
      suggestedVisitDurationMinutes: duration.value,
      bestTimeToVisit: getNullableString(body, "bestTimeToVisit", 500),
      weatherNote: getNullableString(body, "weatherNote", 1000),
      safetyNote: getNullableString(body, "safetyNote", 1000),
      disclaimer: getNullableString(body, "disclaimer", 1000),
      isPopular: body.isPopular === true,
      images: parseImages(body),
    },
  }
}
