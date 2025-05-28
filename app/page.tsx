"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users, Loader2 } from "lucide-react"
import StoryList from "@/components/story-list"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth"

export default function Home() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { stories, loading } = useStore()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Continue your storytelling journey</p>
        </div>
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
        <h2 className="text-2xl font-semibold mb-4">Your Stories</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
