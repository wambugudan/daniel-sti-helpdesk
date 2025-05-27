// File: src/app/api/contract/submit/route.js
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId");
    const workRequestId = formData.get("workRequestId");
    const message = formData.get("message");
    const file = formData.get("file");

    console.log("🔍 Submitting with:", { userId, workRequestId, message });


    if (!userId || !workRequestId || workRequestId === "undefined") {
      return NextResponse.json({ error: "Missing userId or workRequestId" }, { status: 400 });
    }

    const allContracts = await prisma.contract.findMany({
      where: {
        workRequestId,
      },
    });
    console.log("🧾 All contracts for workRequestId:", workRequestId, allContracts);


    // ✅ Find the active contract
    const contract = await prisma.contract.findFirst({
      where: {
        expertId: userId,
        workRequestId,
        // status: "ACTIVE",
        status: "IN_PROGRESS" 
      },
      include: {
        acceptedBid: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "No accepted bid found for this work request and user" },
        { status: 404 }
      );
    }

    // ✅ Handle file upload
    let fileURL = "";
    let fileName = "";
    if (file && typeof file === "object") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueName = `${uuid()}-${file.name}`;
      const uploadPath = path.join(process.cwd(), "public", "uploads", uniqueName);

      await writeFile(uploadPath, buffer);

      fileURL = `/uploads/${uniqueName}`;
      fileName = file.name;
    }

    // ✅ Create or update the submission (because it's one-to-one per bid)
    const existingSubmission = await prisma.submission.findUnique({
      where: { bidId: contract.acceptedBidId },
    });

    const submission = existingSubmission
      ? await prisma.submission.update({
          where: { bidId: contract.acceptedBidId },
          data: {
            message,
            fileURL,
            fileName,
            submittedAt: new Date(),
          },
        })
      : await prisma.submission.create({
          data: {
            bidId: contract.acceptedBidId,
            message,
            fileURL,
            fileName,
            submittedAt: new Date(),
          },
        });

    return NextResponse.json({ message: "Submission saved", submission }, { status: 201 });
  } catch (error) {
    console.error("❌ Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
