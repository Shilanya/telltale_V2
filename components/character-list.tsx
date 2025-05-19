"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { Character } from "@/lib/types"

export default function CharacterList({ characters }: { characters: Character[] }) {
  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No characters found. Create your first character!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {characters.map((character) => (
        <Link href={`/character/${character.id}`} key={character.id} className="block h-full">
          <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
            <div className="relative h-48 w-full">
              {character.image ? (
                <Image
                  src={character.image || "/placeholder.svg"}
                  alt={character.name}
                  fill
                  className="object-cover"
                  unoptimized={character.image.startsWith("data:")}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No character image</p>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{character.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground mb-2">{character.origin}</p>
              <div className="flex flex-wrap gap-1">
                {character.traits.slice(0, 3).map((trait, index) => (
                  <span key={index} className="bg-muted text-xs px-2 py-1 rounded-full">
                    {trait}
                  </span>
                ))}
                {character.traits.length > 3 && (
                  <span className="bg-muted text-xs px-2 py-1 rounded-full">+{character.traits.length - 3}</span>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-xs text-muted-foreground">{formatDate(character.createdAt)}</span>
              <span className="text-sm font-medium hover:underline">View details</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
