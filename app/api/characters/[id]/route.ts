import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const characters = await sql`
      SELECT * FROM characters WHERE id = ${params.id}
    `

    if (characters.length === 0) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    return NextResponse.json(characters[0])
  } catch (error) {
    console.error("Error fetching character:", error)
    return NextResponse.json({ error: "Failed to fetch character" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { name, origin = "", birth_date = "", backstory = "", traits = [], image } = data

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const updatedCharacters = await sql`
      UPDATE characters 
      SET name = ${name}, 
          origin = ${origin}, 
          birth_date = ${birth_date}, 
          backstory = ${backstory}, 
          traits = ${traits}, 
          image = ${image},
          updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    if (updatedCharacters.length === 0) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    return NextResponse.json(updatedCharacters[0])
  } catch (error) {
    console.error("Error updating character:", error)
    return NextResponse.json({ error: "Failed to update character" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`DELETE FROM characters WHERE id = ${params.id}`

    if (result.length === 0) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting character:", error)
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 })
  }
}
