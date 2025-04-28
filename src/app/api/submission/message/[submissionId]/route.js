// File: src/app/api/submission/message/[submissionId]/route.js
import prisma from "@/libs/prisma";

export async function GET(req, { params }) {
  try {
    const { submissionId } = params;
    if (!submissionId) {
      return new Response(JSON.stringify({ error: "Missing submissionId" }), { status: 400 });
    }

    const messages = await prisma.submissionMessage.findMany({
      where: { submissionId },
      include: {
        sender: true, // 👤 include User (sender name, role, etc.)
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return new Response(JSON.stringify({ messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Fetch Messages API error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch messages" }), {
      status: 500,
    });
  }
}
