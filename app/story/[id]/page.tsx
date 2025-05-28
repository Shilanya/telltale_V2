"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Loader2, Users, BookOpen } from "lucide-react"
import { useStore } from "@/lib/store"
import DeleteStoryButton from "@/components/delete-story-button"
import { formatDate } from "@/lib/utils"
import type { Story, Character } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getStory, getCharacter, loading } = useStore()
  const [story, setStory] = useState<Story | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    const loadStory = async () => {
      try {
        // First try to get from store
        if (!loading) {
          const storeStory = getStory(params.id)
          if (storeStory) {
            console.log("Found story in store:", storeStory.id)

            // Ensure all fields exist
            const completeStory = {
              ...storeStory,
              characters: storeStory.characters || [],
              chapters: storeStory.chapters || [],
              description: storeStory.description || "",
            }

            setStory(completeStory)
            setIsLoading(false)
            return
          }
        }

        // If not in store or store is still loading, try API
        console.log("Fetching story from API:", params.id)
        const response = await fetch(`/api/stories/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Story not found")
          }
          throw new Error(`API error: ${response.status}`)
        }

        const apiStory = await response.json()
        console.log("Found story in API:", apiStory.id)

        // Ensure all fields exist
        const completeStory = {
          ...apiStory,
          characters: apiStory.characters || [],
          chapters: apiStory.chapters || [],
          description: apiStory.description || "",
        }

        setStory(completeStory)
      } catch (error) {
        console.error("Error loading story:", error)
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

  // Get characters for this story
  const storyCharacters: Character[] = (story.characters || [])
    .map((id) => getCharacter(id))
    .filter((character): character is Character => character !== undefined)

  // Sort chapters by order
  const sortedChapters = [...(story.chapters || [])].sort((a, b) => a.order - b.order)

  // Determine if we should show tabs (only if there are chapters)
  const showTabs = sortedChapters.length > 0

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline">Back to Stories</Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/edit/${story.id}`}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteStoryButton id={story.id} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
        <p className="text-muted-foreground mb-6">
          Created on {formatDate(story.createdAt)}
          {story.updatedAt !== story.createdAt && ` • Updated on ${formatDate(story.updatedAt)}`}
        </p>

        {story.coverImage && (
          <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={story.coverImage || "/placeholder.svg"}
              alt={story.title}
              fill
              className="object-cover"
              priority
              unoptimized={story.coverImage.startsWith("data:")}
            />
          </div>
        )}

        {story.description && (
          <div className="mb-8 bg-muted/30 p-6 rounded-lg italic">
            <p>{story.description}</p>
          </div>
        )}

        {storyCharacters.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Characters in this Story
            </h2>
            <div className="flex flex-wrap gap-3">
              {storyCharacters.map((character) => (
                <Link
                  key={character.id}
                  href={`/character/${character.id}`}
                  className="flex items-center gap-2 bg-muted hover:bg-muted/80 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden">
                    <Image
                      src={character.image || "/placeholder.svg?height=32&width=32"}
                      alt={character.name}
                      fill
                      className="object-cover"
                      unoptimized={character.image?.startsWith("data:")}
                    />
                  </div>
                  <span>{character.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {showTabs ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
            <TabsList className="w-full flex">
              <TabsTrigger value="all" className="flex-1">
                Full Story
              </TabsTrigger>
              {sortedChapters.map((chapter, index) => (
                <TabsTrigger key={chapter.id} value={chapter.id} className="flex-1">
                  Ch. {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="pt-6">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {sortedChapters.map((chapter, index) => (
                  <div key={chapter.id} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Chapter {index + 1}: {chapter.title}
                    </h2>
                    {chapter.content.split("\n").map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                ))}
              </div>
            </TabsContent>

            {sortedChapters.map((chapter, index) => (
              <TabsContent key={chapter.id} value={chapter.id} className="pt-6">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Chapter {index + 1}: {chapter.title}
                  </h2>
                  {chapter.content.split("\n").map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {story.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
