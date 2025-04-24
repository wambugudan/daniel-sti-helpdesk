import prisma from "@/libs/prisma";

export async function GET(req, { params }) {
  try {
    const { submissionId } = params;
    if (!submissionId) {
      return new Response(JSON.stringify({ error: "Missing submissionId" }), { status: 400 });
    }

    const feedbacks = await prisma.submissionFeedback.findMany({
      where: { submissionId },
      include: {
        council: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return new Response(JSON.stringify({ feedbacks }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Fetch Feedbacks error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch feedbacks" }), {
      status: 500,
    });
  }
}
