export interface Chapter {
  id: string
  title: string
  content: string
  order: number
}

export interface Story {
  id: string
  title: string
  description: string // New field for story description/preview
  content: string
  excerpt: string
  coverImage: string | null
  characters: string[] // Array of character IDs associated with this story
  chapters: Chapter[] // New field for story chapters
  createdAt: string
  updatedAt: string
}

export interface Character {
  id: string
  name: string
  origin: string
  birthDate: string
  backstory: string
  traits: string[]
  image: string | null
  createdAt: string
  updatedAt: string
}
