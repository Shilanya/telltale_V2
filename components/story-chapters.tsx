"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlusCircle, Trash2, MoveUp, MoveDown, Edit, Loader2 } from "lucide-react"
import { generateId } from "@/lib/utils"
import type { Chapter } from "@/lib/types"

interface StoryChaptersProps {
  chapters: Chapter[]
  onChaptersChange: (chapters: Chapter[]) => void
}

export default function StoryChapters({ chapters, onChaptersChange }: StoryChaptersProps) {
  const [isAddingChapter, setIsAddingChapter] = useState(false)
  const [isEditingChapter, setIsEditingChapter] = useState(false)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [chapterTitle, setChapterTitle] = useState("")
  const [chapterContent, setChapterContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sort chapters by order
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order)

  const handleAddChapter = () => {
    setCurrentChapter(null)
    setChapterTitle("")
    setChapterContent("")
    setIsAddingChapter(true)
  }

  const handleEditChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter)
    setChapterTitle(chapter.title)
    setChapterContent(chapter.content)
    setIsEditingChapter(true)
  }

  const handleSaveChapter = () => {
    setIsSubmitting(true)

    try {
      if (currentChapter) {
        // Edit existing chapter
        const updatedChapters = chapters.map((ch) =>
          ch.id === currentChapter.id
            ? {
                ...ch,
                title: chapterTitle,
                content: chapterContent,
                // Preserve existing fields that might be from database
                story_id: ch.story_id || "",
                created_at: ch.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : ch,
        )
        onChaptersChange(updatedChapters)
        setIsEditingChapter(false)
      } else {
        // Add new chapter
        const newChapter: Chapter = {
          id: generateId(),
          title: chapterTitle,
          content: chapterContent,
          order: chapters.length > 0 ? Math.max(...chapters.map((ch) => ch.order)) + 1 : 0,
          story_id: "", // Will be set when story is saved
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        onChaptersChange([...chapters, newChapter])
        setIsAddingChapter(false)
      }

      // Clear form
      setChapterTitle("")
      setChapterContent("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteChapter = (chapterId: string) => {
    const updatedChapters = chapters.filter((ch) => ch.id !== chapterId)

    // Reorder remaining chapters to have sequential order values
    const reorderedChapters = updatedChapters
      .sort((a, b) => a.order - b.order) // Sort by current order first
      .map((ch, index) => ({
        ...ch,
        order: index, // Assign new sequential order starting from 0
      }))

    onChaptersChange(reorderedChapters)
  }

  const handleMoveChapter = (chapterId: string, direction: "up" | "down") => {
    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order)
    const chapterIndex = sortedChapters.findIndex((ch) => ch.id === chapterId)

    if (chapterIndex === -1) return

    const newChapters = [...sortedChapters]

    if (direction === "up" && chapterIndex > 0) {
      // Swap with previous chapter
      ;[newChapters[chapterIndex - 1], newChapters[chapterIndex]] = [
        newChapters[chapterIndex],
        newChapters[chapterIndex - 1],
      ]
    } else if (direction === "down" && chapterIndex < newChapters.length - 1) {
      // Swap with next chapter
      ;[newChapters[chapterIndex], newChapters[chapterIndex + 1]] = [
        newChapters[chapterIndex + 1],
        newChapters[chapterIndex],
      ]
    }

    // Reassign order values to match new positions
    const reorderedChapters = newChapters.map((ch, index) => ({
      ...ch,
      order: index,
    }))

    onChaptersChange(reorderedChapters)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Chapters</h3>
        <Button onClick={handleAddChapter} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      {sortedChapters.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {sortedChapters.map((chapter, index) => (
            <AccordionItem key={chapter.id} value={chapter.id}>
              <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                <div className="flex items-center">
                  <span className="mr-2 text-muted-foreground">#{index + 1}</span>
                  {chapter.title || "Untitled Chapter"}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3">
                      {chapter.content ? (
                        <p>{chapter.content}</p>
                      ) : (
                        <p className="text-muted-foreground italic">No content</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 pb-4 pt-0 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveChapter(chapter.id, "up")}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                      <span className="sr-only">Move Up</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveChapter(chapter.id, "down")}
                      disabled={index === sortedChapters.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                      <span className="sr-only">Move Down</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditChapter(chapter)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </CardFooter>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No chapters yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Add chapters to organize your story into sections.</p>
        </div>
      )}

      {/* Add Chapter Dialog */}
      <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Chapter</DialogTitle>
            <DialogDescription>Create a new chapter for your story.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input
                id="chapter-title"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Enter chapter title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-content">Chapter Content</Label>
              <Textarea
                id="chapter-content"
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                placeholder="Write your chapter content here..."
                className="min-h-[300px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingChapter(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveChapter} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Chapter Dialog */}
      <Dialog open={isEditingChapter} onOpenChange={setIsEditingChapter}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>Update your chapter content.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-chapter-title">Chapter Title</Label>
              <Input
                id="edit-chapter-title"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Enter chapter title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-chapter-content">Chapter Content</Label>
              <Textarea
                id="edit-chapter-content"
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                placeholder="Write your chapter content here..."
                className="min-h-[300px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingChapter(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveChapter} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
