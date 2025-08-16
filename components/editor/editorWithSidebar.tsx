"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { saveSummary, shareSummary } from "@/lib/api";
import { SimpleEditor } from "@/components/tiptap-templates/simple-editor"; 
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export function EditorWithSidebar({
  summary,
  prompt,
  transcript,
  summaryId,
  onBack,
}: {
  summary: string;
  prompt: string;
  transcript: string;
  summaryId: string;
  onBack: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) {
  const [recipients, setRecipients] = useState("");
  const [shareResult, setShareResult] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [editorContent, setEditorContent] = useState(summary);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<any>(null);
  const [lastSavedContent, setLastSavedContent] = useState(summary);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
  const plainText = summary || "";
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  setWordCount(words);
  setCharCount(plainText.length);
}, [summary]);

  useEffect(() => {
    if (editorContent === lastSavedContent) return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      handleSave(true);
    }, 3000);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorContent]);

  const handleEditorChange = (content: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    setEditorContent(plainText);
    const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(plainText.length);
    setShareResult(null);
  };

  const handleSave = async (isAutoSave = false) => {
    setIsSaving(true);
    setSaveResult(null);
    try {
      await saveSummary(summaryId, editorContent);
      setSaveResult({ success: true });
      setLastSavedContent(editorContent);
      if (isAutoSave) {
        toast("Auto-saved", { description: "Your summary was auto-saved." });
      } else {
        toast.success("Summary Saved!");
      }
    } catch (error: any) {
      setSaveResult({ error: "Failed to save summary." });
      toast.error(`${error.message}: Failed to save summary`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!recipients.trim()) return;

    setIsSharing(true);
    setShareResult(null);
    try {
      const emails = recipients
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const result = await shareSummary(summaryId, editorContent, emails);
      if (result?.success || result?.message?.includes("success")) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setShareResult(result);
      toast.info("If you don't see the email, please check your spam folder.");
    } catch (error: any) {
      console.error(error);
      toast.error(`${error.message}: Failed to share summary`);
    } finally {
      setIsSharing(false);
    }
  };



  return (

    <div className="flex flex-col md:flex-row min-h-screen h-auto md:h-screen">
      <aside className="w-full md:w-1/3 md:min-w-[250px] md:max-w-[350px] flex flex-col m-2 max-h-[50vh] md:max-h-full">
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex-[3_0_0%] bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100 p-6 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Prompt
              </h4>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap flex-1 overflow-y-auto overflow-x-hidden leading-relaxed min-h-0 max-h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                <ReactMarkdown>{prompt}</ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="flex-[7_0_0%] bg-gray-50 p-3 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Original Transcript
              </h4>
            </div>
            <div className="bg-white rounded-lg p-4 text-xs text-gray-600 whitespace-pre-wrap flex-1 overflow-y-auto overflow-x-hidden leading-relaxed border border-gray-200 shadow-sm min-h-0 max-h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="prose prose-xs max-w-none prose-headings:text-gray-900 prose-p:text-gray-600">
                <ReactMarkdown>
                  {transcript.replace(/\\n/g, "\n")}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full mx-2 md:ml-0 md:mr-2">
        <div className="bg-background overflow-hidden rounded-lg border shadow flex-1 min-h-[300px] max-h-full mt-4 mb-2 flex flex-col">
          <div className="flex-1 overflow-auto">
            <SimpleEditor
              content={summary}
              onChange={handleEditorChange}
              placeholder="Start writing your summary..."
            />
          </div>

          <div className="border-t p-2 bg-muted/30 flex justify-between items-center text-xs text-muted-foreground">
            <div />
            <div className="flex gap-4">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
            <div />
          </div>
        </div>

        {editorContent !== lastSavedContent ? (
          <div className="mx-2 mb-2 text-yellow-600 text-xs font-medium">
            Unsaved changes
          </div>
        ) : saveResult && 'success' in saveResult ? (
          <div className="mx-2 mb-2 text-green-600 text-xs font-medium">
            Saved!
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4 mx-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <Button onClick={() => handleSave()} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="Recipient emails (comma separated)"
              value={recipients}
              onChange={(e) =>{ setRecipients(e.target.value);
                setShareResult(null);
              }}
              disabled={isSharing}
            />
            <Button
              onClick={handleShare}
              disabled={isSharing || !recipients.trim()}
            >
              {isSharing ? "Sharing..." : "Share"}
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mx-4 mb-2">
          {shareResult && (
            <pre className="text-blue-600 text-sm">
              {JSON.stringify(shareResult)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}