import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data")
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    const dataFile = path.join(dataDir, "stories.json")

    // Check if directories exist
    const dataDirExists = fs.existsSync(dataDir)
    const uploadsDirExists = fs.existsSync(uploadsDir)
    const dataFileExists = fs.existsSync(dataFile)

    // Try to create directories if they don't exist
    if (!dataDirExists) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    if (!uploadsDirExists) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Try to read/write to the data file
    let fileReadable = false
    let fileWritable = false
    let stories = []

    if (dataFileExists) {
      try {
        const data = fs.readFileSync(dataFile, "utf8")
        stories = JSON.parse(data)
        fileReadable = true
      } catch (e) {
        console.error("Error reading file:", e)
      }
    }

    try {
      fs.writeFileSync(dataFile, JSON.stringify(stories, null, 2), "utf8")
      fileWritable = true
    } catch (e) {
      console.error("Error writing file:", e)
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      cwd: process.cwd(),
      directories: {
        dataDir: {
          path: dataDir,
          exists: dataDirExists,
          created: fs.existsSync(dataDir),
        },
        uploadsDir: {
          path: uploadsDir,
          exists: uploadsDirExists,
          created: fs.existsSync(uploadsDir),
        },
        dataFile: {
          path: dataFile,
          exists: dataFileExists,
          readable: fileReadable,
          writable: fileWritable,
        },
      },
      storiesCount: stories.length,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Debug endpoint error", details: error }, { status: 500 })
  }
}
