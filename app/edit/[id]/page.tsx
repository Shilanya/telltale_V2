"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import StoryForm from "@/components/story-form"
import { useStore } from "@/lib/store"
import type { Story } from "@/lib/types"
import { Button } from "@/components/ui/button"

export default function EditStoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getStory, loading } = useStore()
  const [story, setStory] = useState<Story | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStory = async () => {
      try {
        // First try to get from store
        if (!loading) {
          const storeStory = getStory(params.id)
          if (storeStory) {
            console.log("Found story in store for editing:", storeStory.id)

            // Ensure characters field exists
            if (!storeStory.characters) {
              storeStory.characters = []
            }

            setStory(storeStory)
            setIsLoading(false)
            return
          }
        }

        // If not in store or store is still loading, try API
        console.log("Fetching story from API for editing:", params.id)
        const response = await fetch(`/api/stories/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Story not found")
          }
          throw new Error(`API error: ${response.status}`)
        }

        const apiStory = await response.json()
        console.log("Found story in API for editing:", apiStory.id)

        // Ensure characters field exists
        if (!apiStory.characters) {
          apiStory.characters = []
        }

        setStory(apiStory)
      } catch (error) {
        console.error("Error loading story for editing:", error)
        setError(error instanceof Error ? error.message : "Failed to load story")
      } finally {
        setIsLoading(false)
      }
    }

    loadStory()
  }, [params.id, getStory, loading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/")}>Return to Home</Button>
        </div>
      </div>
    )
  }

  if (!story) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Story</h1>
      <StoryForm story={story} />
    </div>
  )
}
