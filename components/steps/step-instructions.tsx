"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit3, ArrowRight, ArrowLeft } from "lucide-react";

interface StepInstructionsProps {
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepInstructions({
  customPrompt,
  onCustomPromptChange,
  onNext,
  onBack,
}: StepInstructionsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Customize AI Instructions</h2>
        <p className="text-muted-foreground">
          Tell the AI how you want your meeting summarized (optional)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Custom Instructions
          </CardTitle>
          <CardDescription>
            Provide specific instructions for how the AI should analyze and
            summarize your meeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Try out Suggestion Prompts..."
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            className="min-h-24 resize-none border-2 border-gray-400"
          />

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Suggestion prompts:</h4>
            <div className="space-y-2 text-sm">
              <button
                className="block w-full text-left bg-white border border-accent/30 rounded px-4 py-2 font-medium shadow-sm hover:bg-accent/10 hover:text-accent transition-colors"
                onClick={() =>
                  onCustomPromptChange(
                    "Focus on action items, deadlines, and who is responsible for each task."
                  )
                }
              >
                • Highlight only action items
              </button>
              <button
                className="block w-full text-left bg-white border border-accent/30 rounded px-4 py-2 font-medium shadow-sm hover:bg-accent/10 hover:text-accent transition-colors"
                onClick={() =>
                  onCustomPromptChange(
                    "Summarize key decisions made and their rationale for executives."
                  )
                }
              >
                • Summarize in bullet points for executives
              </button>
              <button
                className="block w-full text-left bg-white border border-accent/30 rounded px-4 py-2 font-medium shadow-sm hover:bg-accent/10 hover:text-accent transition-colors"
                onClick={() =>
                  onCustomPromptChange(
                    "Organize the summary by topics discussed with main points under each."
                  )
                }
              >
                • Organize by topics discussed
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="px-8">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
