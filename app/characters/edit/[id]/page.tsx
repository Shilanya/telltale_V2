"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import CharacterForm from "@/components/character-form"
import { useStore } from "@/lib/store"
import type { Character } from "@/lib/types"

export default function EditCharacterPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getCharacter, loading } = useStore()
  const [character, setCharacter] = useState<Character | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCharacter = async () => {
      // First try to get from store
      if (!loading) {
        const storeCharacter = getCharacter(params.id)
        if (storeCharacter) {
          console.log("Found character in store for editing:", storeCharacter.id)
          setCharacter(storeCharacter)
          setIsLoading(false)
          return
        }
      }

      // If not in store or store is still loading, try API
      try {
        console.log("Fetching character from API for editing:", params.id)
        const response = await fetch(`/api/characters/${params.id}`)
        if (!response.ok) {
          throw new Error("Character not found")
        }
        const apiCharacter = await response.json()
        console.log("Found character in API for editing:", apiCharacter.id)
        setCharacter(apiCharacter)
      } catch (error) {
        console.error("Error loading character for editing:", error)
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Character</h1>
      <CharacterForm character={character} />
    </div>
  )
}
