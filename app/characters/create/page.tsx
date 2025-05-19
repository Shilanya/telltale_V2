"use client"

import CharacterForm from "@/components/character-form"

export default function CreateCharacterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Character</h1>
      <CharacterForm />
    </div>
  )
}
