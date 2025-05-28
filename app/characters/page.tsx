"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import CharacterList from "@/components/character-list"
import { useStore } from "@/lib/store"

export default function CharactersPage() {
  const { characters, loading } = useStore()

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Characters</h1>
        <Link href="/characters/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Character
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Your Characters</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CharacterList characters={characters} />
        )}
      </div>

      <section className="bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Character Creation</h2>
        <p className="text-muted-foreground">
          Create detailed character profiles for your stories. Add traits, backstories, and images to bring your
          characters to life.
        </p>
      </section>
    </main>
  )
}
