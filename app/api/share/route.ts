import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import sgMail from "@sendgrid/mail";
import { marked } from "marked";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const shareSchema = z.object({
  summaryId: z.string().min(1, "Summary ID is required"),
  summary: z.string().min(1, "Summary content is required"),
  recipients: z
    .array(z.email("Invalid email address"))
    .min(1, "At least one recipient is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summaryId, summary, recipients } = shareSchema.parse(body);

    const summaryRecord = await prisma.summary.findUnique({
      where: { id: summaryId },
    });

    if (!summaryRecord) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    const emailPromises = recipients.map(async (recipient) => {
      try {
        const msg = {
          to: recipient,
          from: process.env.EMAIL_FROM!,
          subject: "Transcript Summary",
          html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Someone has shared a transcript summary with you.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Summary Content:</h3>
        <div style="white-space: pre-wrap; line-height: 1.6;">
          ${marked.parse(summary)}
        </div>
      </div>
      <p style="color: #666; font-size: 14px;">
        This summary was generated using AI and shared via our platform.
      </p>
    </div>
  `,
        };

        await sgMail.send(msg);
        return { recipient, status: "success", error: null };
      } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
        return {
          recipient,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const emailResults = await Promise.all(emailPromises);

    const sharePromises = emailResults.map((result) =>
      prisma.share.create({
        data: {
          summaryId,
          recipients: result.recipient,
          status: result.status,
          error: result.error,
        },
      })
    );

    await Promise.all(sharePromises);

    const failedEmails = emailResults.filter(
      (result) => result.status === "error"
    );

    if (failedEmails.length > 0) {
      return NextResponse.json({
        message: "Some emails failed to send",
        results: emailResults,
      });
    }

    return NextResponse.json({
      message: "All emails sent successfully",
      results: emailResults,
    });
  } catch (error) {
    console.error("Error in share API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
