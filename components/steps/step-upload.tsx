"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, ArrowRight } from "lucide-react"

interface StepUploadProps {
  transcript: string
  onTranscriptChange: (transcript: string) => void
  onNext: () => void
}

export function StepUpload({ transcript, onTranscriptChange, onNext }: StepUploadProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        onTranscriptChange(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Upload Your Meeting Transcript</h2>
        <p className="text-muted-foreground">Start by uploading or pasting your meeting transcript</p>
      </div>

      <Card className="border-dashed border-2 hover:border-accent/50 transition-colors">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Meeting Transcript
          </CardTitle>
          <CardDescription>Upload a text file or paste your meeting transcript below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">TXT files only</p>
              </div>
              <input id="file-upload" type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">OR</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcript">Paste transcript directly</Label>
            <Textarea
              id="transcript"
              placeholder="Paste your meeting transcript here..."
              value={transcript}
              onChange={(e) => onTranscriptChange(e.target.value)}
              className="min-h-32 resize-none"
            />
            {transcript && <p className="text-xs text-muted-foreground">{transcript.length} characters</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onNext} disabled={!transcript.trim()} size="lg" className="px-8">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
