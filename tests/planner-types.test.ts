import assert from "node:assert/strict"
import test from "node:test"
import {
  DEFAULT_DAY_START_TIME,
  DEFAULT_PLANNER_NAME,
  DEFAULT_STAY_DURATION_MINUTES,
  DEFAULT_TRAVEL_MINUTES,
  createEmptyPlannerState,
  formatTimeLabel,
  parseTimeToMinutes,
  plannerStateSignature,
  toPlannerStop,
} from "../lib/planner-types"
import type { AttractionRecord } from "../lib/attractions"

const sampleAttraction: AttractionRecord = {
  id: "attr-1",
  name: "Lipton's Seat",
  slug: "liptons-seat",
  description: "Tea-country lookout with sunrise views.",
  isPopular: true,
  isActive: true,
  reviewCount: 12,
}

test("createEmptyPlannerState returns the default browser-safe planner shape", () => {
  assert.deepEqual(createEmptyPlannerState(), {
    tripName: DEFAULT_PLANNER_NAME,
    tripDate: "",
    dayStartTime: DEFAULT_DAY_START_TIME,
    startLocation: "",
    endLocation: "",
    items: [],
  })
})

test("toPlannerStop applies default timings and allows explicit overrides", () => {
  const defaultStop = toPlannerStop(sampleAttraction)
  const overriddenStop = toPlannerStop(sampleAttraction, {
    visitDurationMinutes: 120,
    travelMinutes: 40,
    transportMode: "car",
    notes: "Start here for sunrise.",
  })

  assert.equal(defaultStop.visitDurationMinutes, DEFAULT_STAY_DURATION_MINUTES)
  assert.equal(defaultStop.travelMinutes, DEFAULT_TRAVEL_MINUTES)
  assert.equal(defaultStop.transportMode, "tuk-tuk")
  assert.equal(defaultStop.notes, "")

  assert.equal(overriddenStop.visitDurationMinutes, 120)
  assert.equal(overriddenStop.travelMinutes, 40)
  assert.equal(overriddenStop.transportMode, "car")
  assert.equal(overriddenStop.notes, "Start here for sunrise.")
})

test("plannerStateSignature only changes for persisted planner fields", () => {
  const firstState = {
    tripName: "Hill Country Loop",
    tripDate: "2026-05-02",
    dayStartTime: "07:30",
    startLocation: "Ella town",
    endLocation: "Haputale",
    items: [
      toPlannerStop(sampleAttraction, {
        notes: "Tea stop",
      }),
    ],
  }

  const presentationOnlyChange = {
    ...firstState,
    items: [
      {
        ...firstState.items[0],
        name: "Lipton's Seat Scenic Viewpoint",
        description: "Updated copy only",
      },
    ],
  }

  const persistedChange = {
    ...firstState,
    items: [
      {
        ...firstState.items[0],
        travelMinutes: 55,
      },
    ],
  }

  assert.equal(
    plannerStateSignature(firstState),
    plannerStateSignature(presentationOnlyChange)
  )
  assert.notEqual(
    plannerStateSignature(firstState),
    plannerStateSignature(persistedChange)
  )
})

test("formatTimeLabel renders midnight, noon, and late-night values in 12-hour time", () => {
  assert.equal(formatTimeLabel(0), "12:00 AM")
  assert.equal(formatTimeLabel(12 * 60), "12:00 PM")
  assert.equal(formatTimeLabel(23 * 60 + 59), "11:59 PM")
})

test("parseTimeToMinutes converts valid values and falls back for invalid input", () => {
  assert.equal(parseTimeToMinutes("07:45"), 465)
  assert.equal(parseTimeToMinutes("00:05"), 5)
  assert.equal(parseTimeToMinutes("invalid"), 8 * 60)
})
