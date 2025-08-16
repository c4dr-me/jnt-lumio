"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { StepIndicator } from "@/components/step-indicator"
import { StepUpload } from "@/components/steps/step-upload"
import { StepInstructions } from "@/components/steps/step-instructions"
import { StepGenerate } from "@/components/steps/step-generate"
import { EditorWithSidebar } from "@/components/editor/editorWithSidebar";

export default function MeetingNotesApp() {
  const [currentStep, setCurrentStep] = useState(1)
  const [transcript, setTranscript] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [summary, setSummary] = useState<any>(null) 
  const [showEditor, setShowEditor] = useState(false)


  const stepLabels = ["Upload", "Instructions", "Generate", "Edit"]

  const handleSummaryGenerated = (generatedSummary: any) => {
    setSummary(generatedSummary)
  }

  const handleEditSummary = () => {
    setShowEditor(true)
  }


if (showEditor && summary) {
    return (
      <>
        <EditorWithSidebar
          summary={summary.content}
          prompt={summary.prompt}
          transcript={summary.transcript}
          summaryId={summary.id}
          onBack={() => {
          setShowEditor(false);
          setCurrentStep(3);
        }}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">AI Meeting Notes</h1>
              <p className="text-sm text-muted-foreground">Transform transcripts into actionable summaries</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <StepIndicator currentStep={currentStep} totalSteps={stepLabels.length} stepLabels={stepLabels} />

        {currentStep === 1 && (
          <StepUpload transcript={transcript} onTranscriptChange={setTranscript} onNext={() => setCurrentStep(2)} />
        )}

        {currentStep === 2 && (
          <StepInstructions
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepGenerate
            transcript={transcript}
            customPrompt={customPrompt}
            summary={summary}
            onSummaryGenerated={handleSummaryGenerated}
            onBack={() => setCurrentStep(2)}
            onEditSummary={handleEditSummary}
          />
        )}
      </main>
    </div>
  )
}