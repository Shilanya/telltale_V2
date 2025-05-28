"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function DevNotice() {
  return (
    <Alert className="mb-6">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Development Mode:</strong> This is a localhost development environment. No real authentication is
        required - just enter any email and name to access the application.
      </AlertDescription>
    </Alert>
  )
}
