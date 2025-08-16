import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const summarizeSchema = z.object({
  transcript: z.string().min(1, 'Transcript is required'),
  prompt: z.string().min(1, 'Prompt is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, prompt } = summarizeSchema.parse(body);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.MODEL_NAME || 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that creates concise, well-structured summaries based on transcripts and specific instructions.'
          },
          {
            role: 'user',
            content: `Transcript: ${transcript}\n\nInstructions: ${prompt}\n\nPlease provide a comprehensive summary based on the transcript and following the given instructions.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const summaryContent = groqData.choices?.[0]?.message?.content || 'No summary generated';

    const summary = await prisma.summary.create({
      data: {
        transcript,
        prompt,
        content: summaryContent,
      },
    });

    return NextResponse.json({
      id: summary.id,
      content: summary.content,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
    });

  } catch (error) {
    console.error('Error in summarize API:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
