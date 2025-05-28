"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Loader2, BookOpen } from "lucide-react"
import { useStore } from "@/lib/store"
import DeleteCharacterButton from "@/components/delete-character-button"
import { formatDate } from "@/lib/utils"
import type { Character } from "@/lib/types"

export default function CharacterPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getCharacter, stories, loading } = useStore()
  const [character, setCharacter] = useState<Character | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCharacter = async () => {
      // First try to get from store
      if (!loading) {
        const storeCharacter = getCharacter(params.id)
        if (storeCharacter) {
          console.log("Found character in store:", storeCharacter.id)
          setCharacter(storeCharacter)
          setIsLoading(false)
          return
        }
      }

      // If not in store or store is still loading, try API
      try {
        console.log("Fetching character from API:", params.id)
        const response = await fetch(`/api/characters/${params.id}`)
        if (!response.ok) {
          throw new Error("Character not found")
        }
        const apiCharacter = await response.json()
        console.log("Found character in API:", apiCharacter.id)
        setCharacter(apiCharacter)
      } catch (error) {
        console.error("Error loading character:", error)
        router.push("/not-found")
      } finally {
        setIsLoading(false)
      }
    }

    loadCharacter()
  }, [params.id, getCharacter, loading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!character) {
    return notFound()
  }

  // Find stories that include this character
  const characterStories = stories.filter((story) => story.characters && story.characters.includes(character.id))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/characters">
          <Button variant="outline">Back to Characters</Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/characters/edit/${character.id}`}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteCharacterButton id={character.id} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/3">
            <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
              <Image
                src={character.image || "/placeholder.svg?height=300&width=300"}
                alt={character.name}
                fill
                className="object-cover"
                priority
                unoptimized={character.image?.startsWith("data:")}
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-2">{character.name}</h1>
            <div className="mb-4">
              <p className="text-muted-foreground">
                Created on {formatDate(character.created_at || character.createdAt || "")}
                {(character.updated_at || character.updatedAt) !== (character.created_at || character.createdAt) &&
                  ` • Updated on ${formatDate(character.updated_at || character.updatedAt || "")}`}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Origin</h2>
                <p>{character.origin || "Not specified"}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Date of Birth</h2>
                <p>{character.birthDate || "Not specified"}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Traits</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {character.traits.length > 0 ? (
                    character.traits.map((trait, index) => (
                      <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                        {trait}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No traits specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {characterStories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Stories Featuring This Character
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characterStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.id}`}
                  className="block p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <h3 className="font-medium">{story.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{story.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Backstory</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {character.backstory ? (
              character.backstory.split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p className="text-muted-foreground">No backstory provided</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
