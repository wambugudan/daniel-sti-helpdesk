// File: src/app/api/submission/message/send/route.js
import prisma from "@/libs/prisma";

export async function POST(req) {
  try {
    const { submissionId, senderId, senderRole, content, fileURL } = await req.json();

    if (!submissionId || !senderId || !senderRole || (!content && !fileURL)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const message = await prisma.submissionMessage.create({
      data: {
        submissionId,
        senderId,
        senderRole,
        content,
        fileURL: fileURL || null,
      },
    });

    return new Response(JSON.stringify({ message }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Send Message API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
    });
  }
}
