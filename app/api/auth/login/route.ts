import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Check if user exists
    const existingUsers = await sql`
      SELECT id, email, name, created_at, updated_at 
      FROM users 
      WHERE email = ${email}
    `

    let user
    if (existingUsers.length > 0) {
      user = existingUsers[0]
    } else {
      // Create new user
      const newUsers = await sql`
        INSERT INTO users (email, name)
        VALUES (${email}, ${name})
        RETURNING id, email, name, created_at, updated_at
      `
      user = newUsers[0]
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
