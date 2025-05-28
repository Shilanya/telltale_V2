"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImagePlus, Loader2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { generateExcerpt } from "@/lib/utils"
import type { Story, Chapter } from "@/lib/types"
import { useNotification, Notification } from "@/components/notification"
import StoryCharacters from "@/components/story-characters"
import StoryChapters from "@/components/story-chapters"

export default function StoryForm({ story }: { story?: Story }) {
  const router = useRouter()
  const { addStory, updateStory: updateStoreStory } = useStore()
  const [title, setTitle] = useState(story?.title || "")
  const [description, setDescription] = useState(story?.description || "")
  const [content, setContent] = useState(story?.content || "")
  const [coverImage, setCoverImage] = useState<string | null>(story?.coverImage || null)
  const [characterIds, setCharacterIds] = useState<string[]>(story?.characters || [])
  const [chapters, setChapters] = useState<Chapter[]>(story?.chapters || [])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("content")

  const { notification, showSuccess, showError, hideNotification } = useNotification()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    setImageFile(file)
    const imageUrl = URL.createObjectURL(file)
    setCoverImage(imageUrl)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      setIsSubmitting(false)
      return
    }

    try {
      let imageUrl = coverImage

      // If there's a new image file, convert it to a data URL for storage
      if (imageFile) {
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(imageFile)
        })
      }

      // Use content from chapters if available, otherwise use the main content
      const finalContent =
        chapters.length > 0
          ? chapters
              .sort((a, b) => a.order - b.order)
              .map((ch) => `# ${ch.title}\n\n${ch.content}`)
              .join("\n\n")
          : content

      const storyData = {
        title,
        description,
        content: finalContent,
        excerpt: generateExcerpt(description || finalContent),
        cover_image: imageUrl,
        characters: characterIds,
        chapters,
      }

      if (story) {
        // Update existing story
        await updateStoreStory(story.id, storyData)
        showSuccess("Story updated successfully!")

        // Navigate to the story page
        setTimeout(() => {
          router.push(`/story/${story.id}`)
        }, 500)
      } else {
        // Create new story
        await addStory(storyData)
        showSuccess("Story created successfully!")

        // Navigate to the homepage after a short delay
        setTimeout(() => {
          router.push("/")
        }, 500)
      }
    } catch (err) {
      console.error("Error saving story:", err)
      setError("Failed to save story. Please try again.")
      showError("Failed to save story. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter story title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief description or preview of your story..."
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              This description will appear on the story card and at the beginning of your story.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover Image</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("cover-image")?.click()}
                className="flex items-center gap-2"
              >
                <ImagePlus className="h-4 w-4" />
                {coverImage ? "Change Image" : "Upload Image"}
              </Button>
              <Input id="cover-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            {coverImage && (
              <div className="relative h-[200px] w-full mt-4 rounded-lg overflow-hidden">
                <Image
                  src={coverImage || "/placeholder.svg"}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  unoptimized={typeof coverImage === "string" && coverImage.startsWith("data:")}
                />
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" type="button">
                Story Content
              </TabsTrigger>
              <TabsTrigger value="chapters" type="button">
                Chapters
              </TabsTrigger>
              <TabsTrigger value="characters" type="button">
                Characters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your story here..."
                  className="min-h-[300px]"
                  disabled={chapters.length > 0}
                />
                {chapters.length > 0 && (
                  <p className="text-sm text-amber-500">
                    You are using chapters. This main content area is disabled. Your content will be compiled from your
                    chapters.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="chapters" className="pt-4">
              <StoryChapters chapters={chapters} onChaptersChange={setChapters} />
            </TabsContent>

            <TabsContent value="characters" className="pt-4">
              <StoryCharacters characterIds={characterIds} onCharactersChange={setCharacterIds} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {story ? "Update Story" : "Create Story"}
            </Button>
          </div>
        </form>
      </CardContent>
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={hideNotification} />
      )}
    </Card>
  )
}
