import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateExcerpt } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    let stories
    if (userId) {
      stories = await sql`
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
        WHERE s.user_id = ${userId}
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `
    } else {
      stories = await sql`
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
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `
    }

    return NextResponse.json(stories)
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { title, description = "", content = "", cover_image, user_id, chapters = [], characters = [] } = data

    if (!title || !user_id) {
      return NextResponse.json({ error: "Title and user_id are required" }, { status: 400 })
    }

    const excerpt = generateExcerpt(description || content)

    // Create story
    const newStories = await sql`
      INSERT INTO stories (title, description, content, excerpt, cover_image, user_id)
      VALUES (${title}, ${description}, ${content}, ${excerpt}, ${cover_image}, ${user_id})
      RETURNING *
    `

    const story = newStories[0]

    // Add chapters if provided
    if (chapters.length > 0) {
      for (const chapter of chapters) {
        await sql`
          INSERT INTO chapters (title, content, "order", story_id)
          VALUES (${chapter.title}, ${chapter.content}, ${chapter.order}, ${story.id})
        `
      }
    }

    // Add character associations if provided
    if (characters.length > 0) {
      for (const characterId of characters) {
        await sql`
          INSERT INTO story_characters (story_id, character_id)
          VALUES (${story.id}, ${characterId})
          ON CONFLICT DO NOTHING
        `
      }
    }

    // Fetch the complete story with relationships
    const completeStories = await sql`
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
      WHERE s.id = ${story.id}
      GROUP BY s.id
    `

    return NextResponse.json(completeStories[0], { status: 201 })
  } catch (error) {
    console.error("Error creating story:", error)
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 })
  }
}
