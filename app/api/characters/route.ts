import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    let characters
    if (userId) {
      characters = await sql`
        SELECT * FROM characters 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `
    } else {
      characters = await sql`
        SELECT * FROM characters 
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json(characters)
  } catch (error) {
    console.error("Error fetching characters:", error)
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, origin = "", birth_date = "", backstory = "", traits = [], image, user_id } = data

    if (!name || !user_id) {
      return NextResponse.json({ error: "Name and user_id are required" }, { status: 400 })
    }

    const newCharacters = await sql`
      INSERT INTO characters (name, origin, birth_date, backstory, traits, image, user_id)
      VALUES (${name}, ${origin}, ${birth_date}, ${backstory}, ${traits}, ${image}, ${user_id})
      RETURNING *
    `

    return NextResponse.json(newCharacters[0], { status: 201 })
  } catch (error) {
    console.error("Error creating character:", error)
    return NextResponse.json({ error: "Failed to create character" }, { status: 500 })
  }
}
