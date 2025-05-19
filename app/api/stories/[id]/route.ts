import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import type { Story } from "@/lib/types"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "stories.json")

// Ensure data directory exists
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    } catch (error) {
      console.error("Failed to create data directory:", error)
    }
  }

  if (!fs.existsSync(DATA_FILE)) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]), "utf8")
    } catch (error) {
      console.error("Failed to create stories file:", error)
    }
  }
}

// Get all stories
function getStories(): Story[] {
  ensureDirectories()
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8")
    const stories = JSON.parse(data)

    // Ensure all stories have the required fields
    return stories.map((story: any) => ({
      ...story,
      characters: story.characters || [],
      chapters: story.chapters || [],
      description: story.description || "",
    }))
  } catch (error) {
    console.error("Error reading stories:", error)
    return []
  }
}

// Get a story by ID
function getStoryById(id: string): Story | undefined {
  const stories = getStories()
  const story = stories.find((story) => story.id === id)

  if (story) {
    // Ensure the story has all required fields
    return {
      ...story,
      characters: story.characters || [],
      chapters: story.chapters || [],
      description: story.description || "",
    }
  }

  return undefined
}

// Save stories
function saveStories(stories: Story[]): boolean {
  ensureDirectories()
  try {
    // Ensure all stories have the required fields before saving
    const validStories = stories.map((story) => ({
      ...story,
      characters: story.characters || [],
      chapters: story.chapters || [],
      description: story.description || "",
    }))

    fs.writeFileSync(DATA_FILE, JSON.stringify(validStories, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error saving stories:", error)
    return false
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const story = getStoryById(params.id)

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    return NextResponse.json(story)
  } catch (error) {
    console.error("Error in GET /api/stories/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updatedStory = await request.json()
    const stories = getStories()
    const index = stories.findIndex((story) => story.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Update the story, ensuring all required fields exist
    stories[index] = {
      ...stories[index],
      ...updatedStory,
      characters: updatedStory.characters || [],
      chapters: updatedStory.chapters || [],
      description: updatedStory.description || "",
    }

    // Save the updated stories
    if (saveStories(stories)) {
      return NextResponse.json(stories[index])
    } else {
      throw new Error("Failed to save story")
    }
  } catch (error) {
    console.error("Error in PUT /api/stories/[id]:", error)
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const stories = getStories()
    const filteredStories = stories.filter((story) => story.id !== params.id)

    if (filteredStories.length === stories.length) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Save the updated stories
    if (saveStories(filteredStories)) {
      return NextResponse.json({ success: true })
    } else {
      throw new Error("Failed to delete story")
    }
  } catch (error) {
    console.error("Error in DELETE /api/stories/[id]:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
  }
}
