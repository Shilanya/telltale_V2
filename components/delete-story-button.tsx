"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { useNotification, Notification } from "@/components/notification"

export default function DeleteStoryButton({ id }: { id: string }) {
  const router = useRouter()
  const { removeStory } = useStore()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { notification, showSuccess, showError, hideNotification } = useNotification()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Remove from store
      removeStory(id)
      console.log("Removed story from store:", id)

      // Also try to delete via API
      try {
        const response = await fetch(`/api/stories/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          console.log("Deleted story from API:", id)
        } else {
          console.warn("API deletion returned non-OK status:", response.status)
        }
      } catch (apiError) {
        console.error("API deletion failed, but story was removed locally:", apiError)
      }

      showSuccess("Story deleted successfully!")

      // Navigate to homepage after a short delay
      setTimeout(() => {
        router.push("/")
      }, 500)
    } catch (error) {
      console.error("Failed to delete story:", error)
      showError("Failed to delete story. Please try again.")
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={hideNotification} />
      )}
    </>
  )
}
