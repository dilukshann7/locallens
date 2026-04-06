import { put, del, list } from "@vercel/blob"

const BLOB_PREFIX = "attractions/"

export async function uploadImage(
  file: File,
  attractionId: string
): Promise<string> {
  const filename = `${attractionId}/${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

  const blob = await put(BLOB_PREFIX + filename, file, {
    addRandomSuffix: true,
    access: "public",
  })

  return blob.url
}

export async function uploadImageFromUrl(
  url: string,
  attractionId: string
): Promise<string> {
  const filename = `${attractionId}/${Date.now()}.jpg`

  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()

  const uploadedBlob = await put(filename, arrayBuffer, {
    addRandomSuffix: true,
    access: "public",
    contentType: response.headers.get("content-type") || "image/jpeg",
  })

  return uploadedBlob.url
}

export async function deleteAttractionImages(attractionId: string) {
  const blobs = await list({
    prefix: BLOB_PREFIX + attractionId,
  })

  for (const blob of blobs.blobs) {
    await del(blob.url)
  }
}

export function getImageUrl(path: string): string {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return `${BLOB_PREFIX}${path}`
}
