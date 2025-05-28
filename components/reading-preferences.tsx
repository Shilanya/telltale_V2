"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface ReadingSettings {
  fontSize: string
  fontFamily: string
  lineHeight: string
  textAlign: string
}

interface ReadingPreferencesProps {
  isOpen: boolean
  onClose: () => void
  settings: ReadingSettings
  onSettingsChange: (settings: Partial<ReadingSettings>) => void
}

const fontOptions = [
  { value: "Inter, system-ui, sans-serif", label: "Inter (Default)" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "system-ui, sans-serif", label: "System Font" },
]

const textAlignOptions = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "justify", label: "Justify" },
]

export default function ReadingPreferences({ isOpen, onClose, settings, onSettingsChange }: ReadingPreferencesProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleFontSizeChange = (value: number[]) => {
    const newSize = `${value[0]}px`
    setLocalSettings({ ...localSettings, fontSize: newSize })
    onSettingsChange({ fontSize: newSize })
  }

  const handleLineHeightChange = (value: number[]) => {
    const newLineHeight = (value[0] / 10).toString()
    setLocalSettings({ ...localSettings, lineHeight: newLineHeight })
    onSettingsChange({ lineHeight: newLineHeight })
  }

  const handleFontFamilyChange = (value: string) => {
    setLocalSettings({ ...localSettings, fontFamily: value })
    onSettingsChange({ fontFamily: value })
  }

  const handleTextAlignChange = (value: string) => {
    setLocalSettings({ ...localSettings, textAlign: value })
    onSettingsChange({ textAlign: value })
  }

  const resetToDefaults = () => {
    const defaults = {
      fontSize: "18px",
      fontFamily: "Inter, system-ui, sans-serif",
      lineHeight: "1.7",
      textAlign: "left",
    }
    setLocalSettings(defaults)
    onSettingsChange(defaults)
  }

  const currentFontSize = Number.parseInt(localSettings.fontSize.replace("px", ""))
  const currentLineHeight = Math.round(Number.parseFloat(localSettings.lineHeight) * 10)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reading Preferences</DialogTitle>
          <DialogDescription>Customize your reading experience. Changes are saved automatically.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview Card */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Preview</Label>
              <div
                className="p-4 border rounded-lg bg-background"
                style={{
                  fontSize: localSettings.fontSize,
                  fontFamily: localSettings.fontFamily,
                  lineHeight: localSettings.lineHeight,
                  textAlign: localSettings.textAlign as "left" | "center" | "right" | "justify",
                }}
              >
                <p>
                  This is a preview of how your text will appear when reading stories. You can adjust the font size,
                  font family, line height, and text alignment to create the most comfortable reading experience for
                  you.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Size: {currentFontSize}px</Label>
            <Slider
              value={[currentFontSize]}
              onValueChange={handleFontSizeChange}
              min={12}
              max={32}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small (12px)</span>
              <span>Large (32px)</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Line Height: {(currentLineHeight / 10).toFixed(1)}</Label>
            <Slider
              value={[currentLineHeight]}
              onValueChange={handleLineHeightChange}
              min={10}
              max={25}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tight (1.0)</span>
              <span>Loose (2.5)</span>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Family</Label>
            <Select value={localSettings.fontFamily} onValueChange={handleFontFamilyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Alignment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Text Alignment</Label>
            <Select value={localSettings.textAlign} onValueChange={handleTextAlignChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {textAlignOptions.map((align) => (
                  <SelectItem key={align.value} value={align.value}>
                    {align.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
