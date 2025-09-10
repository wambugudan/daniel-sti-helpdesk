// file: src/app/api/submission/message/send/route.js
import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // const form = await req.formData();

    // console.log("🔵 Incoming submission message request");

    // const submissionId = form.get("submissionId");
    // const senderId = form.get("senderId");
    // const senderRole = form.get("senderRole");
    // const content = form.get("content");
    // const file = form.get("file");

    const { submissionId, senderId, senderRole, content, file } = await req.json();

    if (!submissionId || !senderId || !senderRole || (!content && !file)) {
      return NextResponse.json(
        { error: "Missing required fields: submissionId, senderId, senderRole, and either content or file are required" },
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
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Figure out recipient
    const recipientId =
      senderId === submission.bid.workRequest.userId
        ? submission.bid.userId
        : submission.bid.workRequest.userId;

    // ✅ Upload file to Supabase if provided
    let fileURL = null;
    if (file) {
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("bucket", "submissions"); // Always use submissions bucket

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads`, {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${await uploadRes.text()}`);
        }

        const { fileURL: uploadedURL } = await uploadRes.json();
        fileURL = uploadedURL;
      } catch (uploadErr) {
        console.error("❌ Supabase upload error:", uploadErr);
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        );
      }
    }

    // ✅ Save message to DB
    const message = await prisma.submissionMessage.create({
      data: {
        submissionId,
        senderId,
        senderRole,
        content: content || null,
        fileURL,
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
