"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, Loader2, Plus, X } from "lucide-react"
import { useStore } from "@/lib/store"
import { generateId } from "@/lib/utils"
import type { Character } from "@/lib/types"
import { useNotification, Notification } from "@/components/notification"

interface CharacterFormProps {
  character?: Character
  inDialog?: boolean
  onCharacterCreated?: (character: Character) => void
  onCharacterUpdated?: (character: Character) => void
}

export default function CharacterForm({
  character,
  inDialog = false,
  onCharacterCreated,
  onCharacterUpdated,
}: CharacterFormProps) {
  const router = useRouter()
  const { addCharacter, updateCharacter } = useStore()
  const [name, setName] = useState(character?.name || "")
  const [origin, setOrigin] = useState(character?.origin || "")
  const [birthDate, setBirthDate] = useState(character?.birthDate || "")
  const [backstory, setBackstory] = useState(character?.backstory || "")
  const [traits, setTraits] = useState<string[]>(character?.traits || [])
  const [newTrait, setNewTrait] = useState("")
  const [image, setImage] = useState<string | null>(character?.image || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { notification, showSuccess, showError, hideNotification } = useNotification()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    setImageFile(file)
    const imageUrl = URL.createObjectURL(file)
    setImage(imageUrl)
    setError(null)
  }

  const addTrait = () => {
    if (newTrait.trim() && !traits.includes(newTrait.trim())) {
      setTraits([...traits, newTrait.trim()])
      setNewTrait("")
    }
  }

  const removeTrait = (traitToRemove: string) => {
    setTraits(traits.filter((trait) => trait !== traitToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!name.trim()) {
      setError("Name is required")
      setIsSubmitting(false)
      return
    }

    try {
      let imageUrl = image

      // If there's a new image file, convert it to a data URL for storage
      if (imageFile) {
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(imageFile)
        })
      }

      const now = new Date().toISOString()

      if (character) {
        // Update existing character
        const updatedCharacter: Character = {
          ...character,
          name,
          origin,
          birthDate,
          backstory,
          traits,
          image: imageUrl,
          updatedAt: now,
        }

        // Update in store
        updateCharacter(character.id, updatedCharacter)

        // Also try to update via API
        try {
          await fetch(`/api/characters/${character.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCharacter),
          })
        } catch (apiError) {
          console.error("API update failed, but character was updated locally:", apiError)
        }

        showSuccess("Character updated successfully!")

        if (inDialog && onCharacterUpdated) {
          onCharacterUpdated(updatedCharacter)
        } else {
          // Navigate to the character page
          setTimeout(() => {
            router.push(`/character/${character.id}`)
          }, 500)
        }
      } else {
        // Create new character
        const newCharacter: Character = {
          id: generateId(),
          name,
          origin,
          birthDate,
          backstory,
          traits,
          image: imageUrl,
          createdAt: now,
          updatedAt: now,
        }

        // Add to store
        addCharacter(newCharacter)

        // Also try to create via API
        try {
          await fetch("/api/characters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCharacter),
          })
        } catch (apiError) {
          console.error("API creation failed, but character was created locally:", apiError)
        }

        showSuccess("Character created successfully!")

        if (inDialog && onCharacterCreated) {
          onCharacterCreated(newCharacter)
        } else {
          // Navigate to the characters page
          setTimeout(() => {
            router.push("/characters")
          }, 500)
        }
      }
    } catch (err) {
      console.error("Error saving character:", err)
      setError("Failed to save character. Please try again.")
      showError("Failed to save character. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
    <>
      {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Character name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Where is this character from?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Date of Birth</Label>
            <Input
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              placeholder="Character's birth date"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Character Traits</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {traits.map((trait, index) => (
              <div key={index} className="bg-muted px-3 py-1 rounded-full flex items-center gap-1">
                <span>{trait}</span>
                <button
                  type="button"
                  onClick={() => removeTrait(trait)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTrait}
              onChange={(e) => setNewTrait(e.target.value)}
              placeholder="Add a character trait"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTrait()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTrait} disabled={!newTrait.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="character-image">Character Image</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("character-image")?.click()}
              className="flex items-center gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              {image ? "Change Image" : "Upload Image"}
            </Button>
            <Input id="character-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          {image && (
            <div className="relative h-[200px] w-full mt-4 rounded-md overflow-hidden">
              <Image
                src={image || "/placeholder.svg"}
                alt="Character preview"
                fill
                className="object-cover"
                unoptimized={typeof image === "string" && image.startsWith("data:")}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="backstory">Backstory</Label>
          <Textarea
            id="backstory"
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            placeholder="Write the character's backstory..."
            className="min-h-[150px]"
          />
        </div>

        <div className="flex justify-end gap-4">
          {!inDialog && (
            <Button type="button" variant="outline" onClick={() => router.push("/characters")} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {character ? "Update Character" : "Create Character"}
          </Button>
        </div>
      </div>
    </>
  )

  if (inDialog) {
    return <form onSubmit={handleSubmit}>{formContent}</form>
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>{formContent}</form>
      </CardContent>
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={hideNotification} />
      )}
    </Card>
  )
}
