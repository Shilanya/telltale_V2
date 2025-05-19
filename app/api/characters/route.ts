import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import type { Character } from "@/lib/types"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "characters.json")

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
      console.error("Failed to create characters file:", error)
    }
  }
}

// Get all characters
function getCharacters(): Character[] {
  ensureDirectories()
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading characters:", error)
    return []
  }
}

// Save characters
function saveCharacters(characters: Character[]): boolean {
  ensureDirectories()
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(characters, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error saving characters:", error)
    return false
  }
}

export async function GET() {
  try {
    const characters = getCharacters()
    return NextResponse.json(characters)
  } catch (error) {
    console.error("Error in GET /api/characters:", error)
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newCharacter = await request.json()
    const characters = getCharacters()

    // Add the new character
    characters.unshift(newCharacter)

    // Save the updated characters
    if (saveCharacters(characters)) {
      return NextResponse.json(newCharacter, { status: 201 })
    } else {
      throw new Error("Failed to save character")
    }
  } catch (error) {
    console.error("Error in POST /api/characters:", error)
    return NextResponse.json({ error: "Failed to create character" }, { status: 500 })
  }
}
