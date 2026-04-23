import assert from "node:assert/strict"
import test from "node:test"
import { validateAttractionPayload } from "../lib/attraction-validation"

function buildImageList() {
  return [
    " https://cdn.example.com/hero.jpg ",
    "/images/local-1.webp",
    "javascript:alert(1)",
    "",
    "https://cdn.example.com/gallery-1.jpg",
    "https://cdn.example.com/gallery-2.jpg",
    "https://cdn.example.com/gallery-3.jpg",
    "https://cdn.example.com/gallery-4.jpg",
    "https://cdn.example.com/gallery-5.jpg",
    "https://cdn.example.com/gallery-6.jpg",
    "https://cdn.example.com/gallery-7.jpg",
    "https://cdn.example.com/gallery-8.jpg",
    "https://cdn.example.com/gallery-9.jpg",
    "https://cdn.example.com/gallery-10.jpg",
    "https://cdn.example.com/gallery-11.jpg",
  ]
}

test("validateAttractionPayload accepts a valid payload and sanitizes optional fields", () => {
  const result = validateAttractionPayload({
    id: " attraction-1 ",
    name: " Nine Arches Bridge ",
    slug: "nine-arches-bridge",
    description: " Iconic colonial bridge with scenic views. ",
    shortDescription: " Popular photo stop ",
    categoryId: " category-1 ",
    latitude: "6.8765",
    longitude: 81.0611,
    address: " Ella, Sri Lanka ",
    distanceFromBeragalaKm: "14.5",
    openingHours: "Always open",
    travelTips: "Go early for the quietest experience.",
    transportInfo: "Reachable by tuk-tuk or train walk.",
    accessibilityInfo: "Steep walk near the tracks.",
    crowdLevel: "Busy at sunset",
    suggestedVisitDurationMinutes: "90",
    bestTimeToVisit: "Morning",
    weatherNote: "Mist can reduce visibility.",
    safetyNote: "Use caution around railway tracks.",
    disclaimer: "Conditions may change.",
    isPopular: true,
    images: buildImageList(),
  })

  assert.equal(result.success, true)

  if (!result.success) {
    return
  }

  assert.deepEqual(result.data, {
    id: "attraction-1",
    name: "Nine Arches Bridge",
    slug: "nine-arches-bridge",
    description: "Iconic colonial bridge with scenic views.",
    shortDescription: "Popular photo stop",
    categoryId: "category-1",
    latitude: "6.8765",
    longitude: "81.0611",
    address: "Ella, Sri Lanka",
    distanceFromBeragalaKm: "14.5",
    openingHours: "Always open",
    travelTips: "Go early for the quietest experience.",
    transportInfo: "Reachable by tuk-tuk or train walk.",
    accessibilityInfo: "Steep walk near the tracks.",
    crowdLevel: "Busy at sunset",
    suggestedVisitDurationMinutes: 90,
    bestTimeToVisit: "Morning",
    weatherNote: "Mist can reduce visibility.",
    safetyNote: "Use caution around railway tracks.",
    disclaimer: "Conditions may change.",
    isPopular: true,
    images: [
      "https://cdn.example.com/hero.jpg",
      "/images/local-1.webp",
      "https://cdn.example.com/gallery-1.jpg",
      "https://cdn.example.com/gallery-2.jpg",
      "https://cdn.example.com/gallery-3.jpg",
      "https://cdn.example.com/gallery-4.jpg",
      "https://cdn.example.com/gallery-5.jpg",
      "https://cdn.example.com/gallery-6.jpg",
      "https://cdn.example.com/gallery-7.jpg",
      "https://cdn.example.com/gallery-8.jpg",
      "https://cdn.example.com/gallery-9.jpg",
      "https://cdn.example.com/gallery-10.jpg",
    ],
  })
})

test("validateAttractionPayload rejects malformed or unsupported inputs", () => {
  const invalidPayloads = [
    {
      input: null,
      error: "Invalid attraction payload.",
    },
    {
      input: {
        name: "Bridge",
        slug: "Bridge",
        description: "Scenic bridge",
        latitude: "6.8",
        longitude: "81.0",
      },
      error: "Slug can contain lowercase letters, numbers, and hyphens only.",
    },
    {
      input: {
        name: "Bridge",
        slug: "bridge",
        description: "Scenic bridge",
        latitude: "91",
        longitude: "81.0",
      },
      error: "Latitude must be 90 or less.",
    },
    {
      input: {
        name: "Bridge",
        slug: "bridge",
        description: "Scenic bridge",
        latitude: "6.8",
        longitude: "east",
      },
      error: "Longitude must be a valid number.",
    },
    {
      input: {
        name: "Bridge",
        slug: "bridge",
        description: "Scenic bridge",
        latitude: "6.8",
        longitude: "81.0",
        suggestedVisitDurationMinutes: "45.5",
      },
      error: "Suggested duration must be a whole number.",
    },
  ]

  for (const payload of invalidPayloads) {
    const result = validateAttractionPayload(payload.input)

    assert.equal(result.success, false)

    if (!result.success) {
      assert.equal(result.error, payload.error)
    }
  }
})
