"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, X, UserPlus } from "lucide-react"
import { useStore } from "@/lib/store"
import CharacterForm from "@/components/character-form"
import type { Character } from "@/lib/types"

interface StoryCharactersProps {
  characterIds: string[]
  onCharactersChange: (characterIds: string[]) => void
}

export default function StoryCharacters({ characterIds, onCharactersChange }: StoryCharactersProps) {
  const { characters, getCharacter, addCharacter } = useStore()
  const [isAddingCharacter, setIsAddingCharacter] = useState(false)
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  // Get the full character objects for the IDs
  const storyCharacters = characterIds
    .map((id) => getCharacter(id))
    .filter((character): character is Character => character !== undefined)

  // Characters that aren't already in the story
  const availableCharacters = characters.filter((character) => !characterIds.includes(character.id))

  const handleAddExistingCharacter = (character: Character) => {
    onCharactersChange([...characterIds, character.id])
    setIsAddingCharacter(false)
  }

  const handleRemoveCharacter = (characterId: string) => {
    onCharactersChange(characterIds.filter((id) => id !== characterId))
  }

  const handleCharacterCreated = (character: Character) => {
    addCharacter(character)
    onCharactersChange([...characterIds, character.id])
    setIsCreatingCharacter(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Characters in this Story</h3>
        <div className="flex gap-2">
          <Dialog open={isAddingCharacter} onOpenChange={setIsAddingCharacter}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={availableCharacters.length === 0}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Existing Character
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Character to Story</DialogTitle>
                <DialogDescription>Select a character to add to this story.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                {availableCharacters.length > 0 ? (
                  availableCharacters.map((character) => (
                    <Card
                      key={character.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleAddExistingCharacter(character)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={character.image || "/placeholder.svg?height=48&width=48"}
                            alt={character.name}
                            fill
                            className="object-cover"
                            unoptimized={character.image?.startsWith("data:")}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{character.name}</h4>
                          <p className="text-sm text-muted-foreground">{character.origin}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No available characters. Create a new character instead.
                  </p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreatingCharacter} onOpenChange={setIsCreatingCharacter}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Character
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Character</DialogTitle>
                <DialogDescription>Create a new character for your story.</DialogDescription>
              </DialogHeader>
              <CharacterForm inDialog onCharacterCreated={handleCharacterCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {storyCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storyCharacters.map((character) => (
            <Card key={character.id} className="overflow-hidden">
              <div className="p-4 flex gap-4">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={character.image || "/placeholder.svg?height=64&width=64"}
                    alt={character.name}
                    fill
                    className="object-cover"
                    unoptimized={character.image?.startsWith("data:")}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{character.name}</h4>
                    <button
                      onClick={() => handleRemoveCharacter(character.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Remove from story"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{character.origin}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {character.traits.slice(0, 3).map((trait, index) => (
                      <span key={index} className="bg-muted text-xs px-2 py-0.5 rounded-full">
                        {trait}
                      </span>
                    ))}
                    {character.traits.length > 3 && (
                      <span className="bg-muted text-xs px-2 py-0.5 rounded-full">+{character.traits.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No characters in this story yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add existing characters or create new ones to populate your story.
          </p>
        </div>
      )}

      {selectedCharacter && (
        <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Character</DialogTitle>
            </DialogHeader>
            <CharacterForm
              character={selectedCharacter}
              inDialog
              onCharacterUpdated={() => setSelectedCharacter(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
