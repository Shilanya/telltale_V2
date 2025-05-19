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

export async function GET() {
  try {
    const stories = getStories()
    return NextResponse.json(stories)
  } catch (error) {
    console.error("Error in GET /api/stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newStory = await request.json()
    const stories = getStories()

    // Ensure the new story has all required fields
    const storyWithRequiredFields = {
      ...newStory,
      characters: newStory.characters || [],
      chapters: newStory.chapters || [],
      description: newStory.description || "",
    }

    // Add the new story
    stories.unshift(storyWithRequiredFields)

    // Save the updated stories
    if (saveStories(stories)) {
      return NextResponse.json(storyWithRequiredFields, { status: 201 })
    } else {
      throw new Error("Failed to save story")
    }
  } catch (error) {
    console.error("Error in POST /api/stories:", error)
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 })
  }
}
