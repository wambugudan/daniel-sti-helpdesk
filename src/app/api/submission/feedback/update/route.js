import prisma from "@/libs/prisma";

export async function PUT(req) {
  try {
    const { feedbackId, comment, status } = await req.json();

    if (!feedbackId || !comment || !status) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const updated = await prisma.submissionFeedback.update({
      where: { id: feedbackId },
      data: { comment, status },
    });

    return new Response(JSON.stringify({ updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Update Feedback error:", error);
    return new Response(JSON.stringify({ error: "Failed to update feedback" }), {
      status: 500,
    });
  }
}
