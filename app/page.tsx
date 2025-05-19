"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users } from "lucide-react"
import StoryList from "@/components/story-list"
import { useStore } from "@/lib/store"

export default function Home() {
  const { stories, loading } = useStore()

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tell-Tale</h1>
        <div className="flex gap-2">
          <Link href="/characters">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View Characters
            </Button>
          </Link>
          <Link href="/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Story
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Stories</h2>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading stories...</p>
          </div>
        ) : (
          <StoryList stories={stories} />
        )}
      </div>

      <section className="bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Welcome to Tell-Tale</h2>
        <p className="text-muted-foreground">
          Share your stories with the world. Create, edit, and manage your writing projects with ease. Upload images to
          accompany your tales and build your portfolio of creative works.
        </p>
        <div className="mt-4">
          <Link href="/characters">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Your Characters
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
