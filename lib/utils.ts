import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function generateExcerpt(content: string, maxLength = 150): string {
  if (content.length <= maxLength) return content

  // Find the last space before maxLength
  const lastSpace = content.substring(0, maxLength).lastIndexOf(" ")
  return content.substring(0, lastSpace) + "..."
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
