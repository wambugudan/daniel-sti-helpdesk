// File: src/app/api/submission/message/send/route.js

import prisma from "@/libs/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const form = await req.formData();

    const submissionId = form.get("submissionId");
    const senderId = form.get("senderId");
    const senderRole = form.get("senderRole");
    const content = form.get("content");
    const file = form.get("file");

    if (!submissionId || !senderId || !senderRole || (!content && !file)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    let fileURL = null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Ensure upload folder exists
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      // Create unique file name (optional: add timestamp or cuid)
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      fileURL = `/uploads/${fileName}`; // URL accessible via public/
    }

    // Save to DB
    const message = await prisma.submissionMessage.create({
      data: {
        submissionId,
        senderId,
        senderRole,
        content,
        fileURL,
      },
    });

    return new Response(JSON.stringify({ message }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Send Message API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to send message" }), { status: 500 });
  }
}


