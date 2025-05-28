import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateExcerpt } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stories = await sql`
      SELECT s.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'title', c.title,
                   'content', c.content,
                   'order', c."order",
                   'created_at', c.created_at,
                   'updated_at', c.updated_at
                 ) ORDER BY c."order"
               ) FILTER (WHERE c.id IS NOT NULL), 
               '[]'
             ) as chapters,
             COALESCE(
               json_agg(DISTINCT sc.character_id) FILTER (WHERE sc.character_id IS NOT NULL),
               '[]'
             ) as characters
      FROM stories s
      LEFT JOIN chapters c ON s.id = c.story_id
      LEFT JOIN story_characters sc ON s.id = sc.story_id
      WHERE s.id = ${params.id}
      GROUP BY s.id
    `

    if (stories.length === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    return NextResponse.json(stories[0])
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { title, description = "", content = "", cover_image, chapters = [], characters = [] } = data

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const excerpt = generateExcerpt(description || content)

    // Update story
    await sql`
      UPDATE stories 
      SET title = ${title}, 
          description = ${description}, 
          content = ${content}, 
          excerpt = ${excerpt}, 
          cover_image = ${cover_image},
          updated_at = NOW()
      WHERE id = ${params.id}
    `

    // Delete existing chapters
    await sql`DELETE FROM chapters WHERE story_id = ${params.id}`

    // Add new chapters
    if (chapters.length > 0) {
      for (const chapter of chapters) {
        await sql`
          INSERT INTO chapters (title, content, "order", story_id)
          VALUES (${chapter.title}, ${chapter.content}, ${chapter.order}, ${params.id})
        `
      }
    }

    // Delete existing character associations
    await sql`DELETE FROM story_characters WHERE story_id = ${params.id}`

    // Add new character associations
    if (characters.length > 0) {
      for (const characterId of characters) {
        await sql`
          INSERT INTO story_characters (story_id, character_id)
          VALUES (${params.id}, ${characterId})
          ON CONFLICT DO NOTHING
        `
      }
    }

    // Fetch the updated story
    const updatedStories = await sql`
      SELECT s.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'title', c.title,
                   'content', c.content,
                   'order', c."order",
                   'created_at', c.created_at,
                   'updated_at', c.updated_at
                 ) ORDER BY c."order"
               ) FILTER (WHERE c.id IS NOT NULL), 
               '[]'
             ) as chapters,
             COALESCE(
               json_agg(DISTINCT sc.character_id) FILTER (WHERE sc.character_id IS NOT NULL),
               '[]'
             ) as characters
      FROM stories s
      LEFT JOIN chapters c ON s.id = c.story_id
      LEFT JOIN story_characters sc ON s.id = sc.story_id
      WHERE s.id = ${params.id}
      GROUP BY s.id
    `

    return NextResponse.json(updatedStories[0])
  } catch (error) {
    console.error("Error updating story:", error)
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`DELETE FROM stories WHERE id = ${params.id}`

    if (result.length === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
  }
}
