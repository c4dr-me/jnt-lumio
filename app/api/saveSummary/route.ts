import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const saveSummarySchema = z.object({
  id: z.string().min(1, 'Summary ID is required'),
  content: z.string().min(1, 'Content is required'),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content } = saveSummarySchema.parse(body);

    const updatedSummary = await prisma.summary.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json({
      id: updatedSummary.id,
      content: updatedSummary.content,
      updatedAt: updatedSummary.updatedAt,
    });

  } catch (error) {
    console.error('Error saving summary:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
