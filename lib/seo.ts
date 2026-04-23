import type { Metadata } from "next"

interface PageMetadataOptions {
  title?: string
  description?: string
}

export const siteConfig = {
  name: "LocalLens",
  description:
    "Discover attractions, practical travel tips, and day-trip plans around Beragala and Ella, Sri Lanka.",
  themeColor: "#059669",
} as const

function resolveMetadataTitle(title?: string): string {
  if (!title) {
    return siteConfig.name
  }

  return `${title} | ${siteConfig.name}`
}

export function truncateText(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`
}

export function createPageMetadata({
  title,
  description = siteConfig.description,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    applicationName: siteConfig.name,
    appleWebApp: {
      title: resolveMetadataTitle(title),
    },
  }
}
