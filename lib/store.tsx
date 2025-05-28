"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Story, Character } from "./types"
import { useAuth } from "./auth"

interface StoreContextType {
  // Stories
  stories: Story[]
  addStory: (story: Omit<Story, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>
  updateStory: (id: string, updatedStory: Omit<Story, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>
  removeStory: (id: string) => Promise<void>
  getStory: (id: string) => Story | undefined

  // Characters
  characters: Character[]
  addCharacter: (character: Omit<Character, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>
  updateCharacter: (
    id: string,
    updatedCharacter: Omit<Character, "id" | "created_at" | "updated_at" | "user_id">,
  ) => Promise<void>
  removeCharacter: (id: string) => Promise<void>
  getCharacter: (id: string) => Character | undefined

  loading: boolean
  refreshData: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from API
  const refreshData = async () => {
    if (!user) {
      setStories([])
      setCharacters([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch stories
      const storiesResponse = await fetch(`/api/stories?user_id=${user.id}`)
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json()
        // Map database field names to camelCase for components
        const mappedStories = storiesData.map((story: any) => ({
          ...story,
          createdAt: story.created_at,
          updatedAt: story.updated_at,
          coverImage: story.cover_image,
        }))
        setStories(mappedStories)
      }

      // Fetch characters
      const charactersResponse = await fetch(`/api/characters?user_id=${user.id}`)
      if (charactersResponse.ok) {
        const charactersData = await charactersResponse.json()
        // Map database field names to camelCase for components
        const mappedCharacters = charactersData.map((character: any) => ({
          ...character,
          createdAt: character.created_at,
          updatedAt: character.updated_at,
          birthDate: character.birth_date,
        }))
        setCharacters(mappedCharacters)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load data when user changes
  useEffect(() => {
    refreshData()
  }, [user])

  // Story methods
  const addStory = async (storyData: Omit<Story, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!user) return

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...storyData, user_id: user.id }),
      })

      if (response.ok) {
        const newStory = await response.json()
        setStories((prev) => [newStory, ...prev])
      }
    } catch (error) {
      console.error("Error creating story:", error)
      throw error
    }
  }

  const updateStory = async (id: string, storyData: Omit<Story, "id" | "created_at" | "updated_at" | "user_id">) => {
    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyData),
      })

      if (response.ok) {
        const updatedStory = await response.json()
        setStories((prev) => prev.map((story) => (story.id === id ? updatedStory : story)))
      }
    } catch (error) {
      console.error("Error updating story:", error)
      throw error
    }
  }

  const removeStory = async (id: string) => {
    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setStories((prev) => prev.filter((story) => story.id !== id))
      }
    } catch (error) {
      console.error("Error deleting story:", error)
      throw error
    }
  }

  const getStory = (id: string) => {
    return stories.find((story) => story.id === id)
  }

  // Character methods
  const addCharacter = async (characterData: Omit<Character, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!user) return

    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...characterData, user_id: user.id }),
      })

      if (response.ok) {
        const newCharacter = await response.json()
        setCharacters((prev) => [newCharacter, ...prev])
      }
    } catch (error) {
      console.error("Error creating character:", error)
      throw error
    }
  }

  const updateCharacter = async (
    id: string,
    characterData: Omit<Character, "id" | "created_at" | "updated_at" | "user_id">,
  ) => {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(characterData),
      })

      if (response.ok) {
        const updatedCharacter = await response.json()
        setCharacters((prev) => prev.map((character) => (character.id === id ? updatedCharacter : character)))
      }
    } catch (error) {
      console.error("Error updating character:", error)
      throw error
    }
  }

  const removeCharacter = async (id: string) => {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCharacters((prev) => prev.filter((character) => character.id !== id))
      }
    } catch (error) {
      console.error("Error deleting character:", error)
      throw error
    }
  }

  const getCharacter = (id: string) => {
    return characters.find((character) => character.id === id)
  }

  return (
    <StoreContext.Provider
      value={{
        stories,
        addStory,
        updateStory,
        removeStory,
        getStory,
        characters,
        addCharacter,
        updateCharacter,
        removeCharacter,
        getCharacter,
        loading,
        refreshData,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
