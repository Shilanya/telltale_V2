"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { BookOpen } from "lucide-react"
import type { Story } from "@/lib/types"

export default function StoryList({ stories }: { stories: Story[] }) {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No stories found. Create your first story!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <Link href={`/story/${story.id}`} key={story.id} className="block h-full">
          <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
            <div className="relative h-48 w-full">
              {story.coverImage ? (
                <Image
                  src={story.coverImage || "/placeholder.svg"}
                  alt={story.title}
                  fill
                  className="object-cover"
                  unoptimized={story.coverImage.startsWith("data:")}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No cover image</p>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{story.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground line-clamp-3">{story.description || story.excerpt}</p>
              {story.chapters && story.chapters.length > 0 && (
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {story.chapters.length} {story.chapters.length === 1 ? "Chapter" : "Chapters"}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDate(story.created_at || story.createdAt || "")}
              </span>
              <span className="text-sm font-medium hover:underline">Read more</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
