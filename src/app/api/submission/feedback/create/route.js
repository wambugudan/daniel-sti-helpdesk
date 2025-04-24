// File: src/app/api/submission/feedback/create/route.js
import prisma from "@/libs/prisma";

export async function POST(req) {
  try {
    const { submissionId, feedback, status, userId } = await req.json();

    if (!submissionId || !feedback || !status || !userId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const newFeedback = await prisma.submissionFeedback.create({
      data: {
        submissionId,
        comment: feedback,
        status,
        councilId: userId,
      },
    });

    return new Response(JSON.stringify({ feedback: newFeedback }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return new Response(JSON.stringify({ error: "Failed to send feedback" }), {
      status: 500,
    });
  }
}
