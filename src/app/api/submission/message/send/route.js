// file: src/app/api/submission/message/send/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { submissionId, senderId, senderRole, content, fileURL } = await req.json();

    if (!submissionId || !senderId || !senderRole || (!content && !fileURL)) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: submissionId, senderId, senderRole, and either content or fileURL are required",
        },
        { status: 400 }
      );
    }

    // ✅ Validate submission exists
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        bid: {
          include: {
            workRequest: {
              select: { id: true, userId: true, title: true },
            },
            user: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // ✅ Figure out recipient
    const recipientId =
      senderId === submission.bid.workRequest.userId
        ? submission.bid.userId
        : submission.bid.workRequest.userId;

    // ✅ Save message to DB
    const message = await prisma.submissionMessage.create({
      data: {
        submissionId,
        senderId,
        senderRole,
        content: content || null,
        fileURL: fileURL || null,
      },
      include: {
        sender: {
          select: { name: true },
        },
      },
    });

    // ✅ Send notification to recipient
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: recipientId,
          type: "MESSAGE",
          message: `New message from ${message.sender.name} in "${submission.bid.workRequest.title}"`,
          relatedId: submission.bid.workRequest.id,
          relatedTitle: submission.bid.workRequest.title,
          relatedType: "WORK_REQUEST",
          link: `/my-work-request?requestId=${submission.bid.workRequest.id}&message=true`,
        }),
      });
    } catch (notificationError) {
      console.error("⚠️ Failed to send notification:", notificationError);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Message submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
