// File: src/app/api/submission/feedback/reply/route.js
import prisma from "@/libs/prisma";

export async function POST(req) {
  try {
    const { feedbackId, replyMessage } = await req.json();

    if (!feedbackId || !replyMessage) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const updated = await prisma.submissionFeedback.update({
      where: { id: feedbackId },
      data: {
        replyMessage,
        replyAt: new Date(),
      },
    });

    return new Response(JSON.stringify({ updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Reply API error:", error);
    return new Response(JSON.stringify({ error: "Failed to send reply" }), {
      status: 500,
    });
  }
}
