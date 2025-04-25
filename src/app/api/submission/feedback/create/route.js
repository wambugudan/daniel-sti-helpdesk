
// File: src/app/api/submission/feedback/create/route.js
import prisma from "@/libs/prisma";

export async function POST(req) {
  try {
    // ✅ Read body only once
    const body = await req.json();
    console.log("Incoming body:", body);

    const { submissionId, comment, status, councilId } = body;

    // ✅ Validate required fields
    if (!submissionId || !comment || !status || !councilId) {
      console.warn("❌ Missing fields", { submissionId, comment, status, councilId });
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const newFeedback = await prisma.submissionFeedback.create({
      data: {
        submissionId,
        comment,
        status,
        councilId,
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

