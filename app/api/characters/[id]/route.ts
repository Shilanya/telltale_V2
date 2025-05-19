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

// Get a character by ID
function getCharacterById(id: string): Character | undefined {
  const characters = getCharacters()
  return characters.find((character) => character.id === id)
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const character = getCharacterById(params.id)

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    return NextResponse.json(character)
  } catch (error) {
    console.error("Error in GET /api/characters/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch character" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updatedCharacter = await request.json()
    const characters = getCharacters()
    const index = characters.findIndex((character) => character.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    // Update the character
    characters[index] = { ...characters[index], ...updatedCharacter }

    // Save the updated characters
    if (saveCharacters(characters)) {
      return NextResponse.json(characters[index])
    } else {
      throw new Error("Failed to save character")
    }
  } catch (error) {
    console.error("Error in PUT /api/characters/[id]:", error)
    return NextResponse.json({ error: "Failed to update character" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const characters = getCharacters()
    const filteredCharacters = characters.filter((character) => character.id !== params.id)

    if (filteredCharacters.length === characters.length) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    // Save the updated characters
    if (saveCharacters(filteredCharacters)) {
      return NextResponse.json({ success: true })
    } else {
      throw new Error("Failed to delete character")
    }
  } catch (error) {
    console.error("Error in DELETE /api/characters/[id]:", error)
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 })
  }
}
