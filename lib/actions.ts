"use server"

import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"
import { generateId, generateExcerpt } from "./utils"
import type { Story } from "./types"

// Path to our "database" file
const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "stories.json")
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

// Ensure data directory exists
function ensureDirectories() {
  // Use synchronous methods to ensure directories exist before proceeding
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }

  // Create empty stories file if it doesn't exist
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf8")
  }
}

// Read all stories from the JSON file
export async function getStories(): Promise<Story[]> {
  ensureDirectories()

  try {
    const data = fs.readFileSync(DATA_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading stories:", error)
    // If file doesn't exist or is invalid, return empty array
    return []
  }
}

// Get a single story by ID
export async function getStoryById(id: string): Promise<Story | null> {
  const stories = await getStories()
  return stories.find((story) => story.id === id) || null
}

// Save stories to the JSON file
async function saveStories(stories: Story[]) {
  ensureDirectories()
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(stories, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error saving stories:", error)
    return false
  }
}

// Save an uploaded image and return its path
async function saveImage(file: File): Promise<string | null> {
  try {
    ensureDirectories()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`.toLowerCase()
    const filePath = path.join(UPLOADS_DIR, fileName)

    fs.writeFileSync(filePath, buffer)
    return `/uploads/${fileName}`
  } catch (error) {
    console.error("Error saving image:", error)
    return null
  }
}

// Create a new story
export async function createStory(formData: FormData): Promise<Story> {
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const imageFile = formData.get("image") as File | null

  let coverImage: string | null = null
  if (imageFile && imageFile.size > 0) {
    coverImage = await saveImage(imageFile)
  }

  const now = new Date().toISOString()
  const newStory: Story = {
    id: generateId(),
    title,
    content,
    excerpt: generateExcerpt(content),
    coverImage,
    createdAt: now,
    updatedAt: now,
  }

  const stories = await getStories()
  stories.unshift(newStory) // Add to beginning of array
  await saveStories(stories)

  revalidatePath("/")
  return newStory
}

// Update an existing story
export async function updateStory(id: string, formData: FormData): Promise<Story | null> {
  const stories = await getStories()
  const storyIndex = stories.findIndex((story) => story.id === id)

  if (storyIndex === -1) return null

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const imageFile = formData.get("image") as File | null

  let coverImage = stories[storyIndex].coverImage
  if (imageFile && imageFile.size > 0) {
    coverImage = await saveImage(imageFile)
  }

  const updatedStory: Story = {
    ...stories[storyIndex],
    title,
    content,
    excerpt: generateExcerpt(content),
    coverImage,
    updatedAt: new Date().toISOString(),
  }

  stories[storyIndex] = updatedStory
  await saveStories(stories)

  revalidatePath("/")
  revalidatePath(`/story/${id}`)
  return updatedStory
}

// Delete a story
export async function deleteStory(id: string): Promise<boolean> {
  const stories = await getStories()
  const filteredStories = stories.filter((story) => story.id !== id)

  if (filteredStories.length === stories.length) {
    return false // Story not found
  }

  await saveStories(filteredStories)
  revalidatePath("/")
  return true
}
