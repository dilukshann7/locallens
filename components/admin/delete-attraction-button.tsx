"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"

interface AdminDeleteAttractionButtonProps {
  attractionId: string
}

export function AdminDeleteAttractionButton({
  attractionId,
}: AdminDeleteAttractionButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this attraction and its uploaded images?"
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/attractions/${attractionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete attraction")
      }

      router.refresh()
    } catch (error) {
      console.error("Delete failed:", error)
      window.alert("Failed to delete attraction")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
      title="Delete attraction"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  )
}
