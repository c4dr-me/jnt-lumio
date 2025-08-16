"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Loader2, FileText, Edit3 } from "lucide-react"
import { toast } from "sonner"
import { summarize, shareSummary } from '@/lib/api';
import { marked } from "marked";

interface Summary {
  id: string
  transcript: string
  prompt: string
  content: string
  createdAt: string
  updatedAt: string
}

interface StepGenerateProps {
  transcript: string
  customPrompt: string
  summary: Summary | null
  onSummaryGenerated: (summary: Summary) => void
  onBack: () => void
  onEditSummary: () => void
}

export function StepGenerate({
  transcript,
  customPrompt,
  summary,
  onSummaryGenerated,
  onBack,
  onEditSummary,
}: StepGenerateProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [recipients, setRecipients] = useState("")
  const [shareResult, setShareResult] = useState<any>(null)
  const [isSharing, setIsSharing] = useState(false)

  const DEFAULT_PROMPT = "Summarize the meeting transcript into clear, actionable notes."

  const generateSummary = async () => {
    if (!transcript.trim()) {
      toast.error("Please provide a transcript to summarize")
      return
    }
    let promptToUse = customPrompt.trim();
  if (!promptToUse) {
    promptToUse = DEFAULT_PROMPT;
    toast.info("No prompt provided. Using default prompt.");
  }

    setIsProcessing(true)
    try {
      const data = await summarize(transcript, promptToUse)
      if (data && data.content && data.id) {
        const newSummary: Summary = {
          id: data.id,
          transcript,
          prompt: promptToUse,
          content: data.content,
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt || "",
        }
        onSummaryGenerated(newSummary)
        toast.success("Summary generated successfully!")
      } else {
        throw new Error("Invalid response format from server")
      }
    } catch (error: any) {
      console.error("Error generating summary:", error)
      toast.error(error.message || "Failed to generate summary. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShare = async () => {
    if (!recipients.trim()) {
      toast.error("Please enter at least one recipient email.")
      return
    }
    setIsSharing(true)
    setShareResult(null)
    try {
      const emails = recipients.split(",").map(e => e.trim()).filter(Boolean)
      const result = await shareSummary(summary!.id, summary!.content, emails)
      setShareResult(result)
      if (result.message?.includes("success")) {
        toast.success("Summary shared successfully!")
      } else {
        toast.error("Some emails failed to send.")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to share summary.")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Generate AI Summary</h2>
        <p className="text-muted-foreground">
          {summary ? "Your summary is ready!" : "Ready to generate your meeting summary"}
        </p>
      </div>

      {summary ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                AI-Generated Summary
              </CardTitle>
              <CardDescription>Your meeting summary is ready for editing</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              AI Generated
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg max-h-64 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: marked.parse(summary.content) }}
              ></div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button onClick={onEditSummary} size="lg" className="px-8">
                <Edit3 className="w-4 h-4 mr-2" />
                Open in Editor
              </Button>
            </div>
            <div className="mt-8">
              <h4 className="font-medium mb-2">Share this summary via email</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2 text-sm"
                  placeholder="Recipient emails (comma separated)"
                  value={recipients}
                  onChange={e => setRecipients(e.target.value)}
                  disabled={isSharing}
                />
                <Button onClick={handleShare} disabled={isSharing || !recipients.trim()}>
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>Share</>
                  )}
                </Button>
              </div>
              {shareResult && (
                <div className="mt-2 text-sm">
                  <pre className="bg-muted/30 rounded p-2 overflow-x-auto">{JSON.stringify(shareResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Ready to generate your summary</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The AI will analyze your transcript and create a structured summary
                </p>
              </div>
              <Button
                onClick={generateSummary}
                disabled={isProcessing}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" className="hover:bg-black" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  )
}