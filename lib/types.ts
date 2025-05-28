export interface Chapter {
  id: string
  title: string
  content: string
  order: number
  story_id: string
  created_at: string
  updated_at: string
}

export interface Story {
  id: string
  title: string
  description: string
  content: string
  excerpt: string
  cover_image: string | null
  coverImage?: string | null // For backward compatibility
  user_id: string
  characters: string[] // Array of character IDs associated with this story
  chapters: Chapter[] // Story chapters
  created_at: string
  updated_at: string
  createdAt?: string // For backward compatibility
  updatedAt?: string // For backward compatibility
}

export interface Character {
  id: string
  name: string
  origin: string
  birth_date: string
  birthDate?: string // For backward compatibility
  backstory: string
  traits: string[]
  image: string | null
  user_id: string
  created_at: string
  updated_at: string
  createdAt?: string // For backward compatibility
  updatedAt?: string // For backward compatibility
}

export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}
